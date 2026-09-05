import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PayFastProvider } from "@/lib/payments/payfast";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/payfast
 * Body: { shippingAddressId, billingAddressId, couponCode? }
 *
 * Creates a PENDING order from the user's cart, then returns the
 * PayFast process URL + signed fields for the client to auto-submit.
 * No payment is marked successful here — that only happens once the
 * ITN webhook is verified (see /api/webhooks/payfast).
 */
export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { shippingAddressId, billingAddressId, couponCode } = await req.json();
  const userId = (session.user as any).id as string;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cart.items.reduce((sum: any, item: any) => {
    const unitPrice = Number(item.product.price) + Number(item.variant?.priceDelta || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  let shippingCost =
    settings?.freeShippingOver && subtotal >= Number(settings.freeShippingOver)
      ? 0
      : Number(settings?.flatShippingRate || 0);

  // Coupon is re-validated and recomputed server-side — never trust a
  // discount amount passed from the client.
  let discountTotal = 0;
  let appliedCouponCode: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) &&
      (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue));

    if (valid && coupon) {
      appliedCouponCode = coupon.code;
      if (coupon.type === "PERCENTAGE") {
        discountTotal = subtotal * (Number(coupon.amount) / 100);
        if (coupon.maxDiscount) discountTotal = Math.min(discountTotal, Number(coupon.maxDiscount));
      } else if (coupon.type === "FIXED") {
        discountTotal = Math.min(Number(coupon.amount), subtotal);
      } else if (coupon.type === "FREE_SHIPPING") {
        shippingCost = 0;
      }
      await prisma.coupon.update({ where: { id: coupon.id }, data: { timesUsed: { increment: 1 } } });
    }
  }

  const total = subtotal + shippingCost - discountTotal;

  const order = await prisma.order.create({
    data: {
      orderNumber: `PV-${Date.now()}`,
      userId,
      shippingAddressId,
      billingAddressId,
      subtotal,
      shippingCost,
      discountTotal,
      total,
      couponCode: appliedCouponCode,
      status: "PENDING",
      paymentStatus: "PENDING",
      items: {
        create: cart.items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          quantity: item.quantity,
          unitPrice: Number(item.product.price) + Number(item.variant?.priceDelta || 0),
        })),
      },
      statusHistory: { create: { status: "PENDING", note: "Order created, awaiting payment" } },
    },
  });

  const payfast = new PayFastProvider();
  const fields = payfast.buildRedirectFields({
    orderId: order.id,
    amount: total,
    itemName: `Pet Valley Order ${order.orderNumber}`,
    firstName: session.user.name?.split(" ")[0],
    email: session.user.email || undefined,
  });

  if (appliedCouponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: appliedCouponCode } });
    if (coupon) {
      await prisma.couponUsage.create({ data: { couponId: coupon.id, userId, orderId: order.id } });
    }
  }

  return NextResponse.json({
    processUrl: payfast.getProcessUrl(),
    fields,
    orderId: order.id,
  });
}
