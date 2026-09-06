import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/manual
 * Body: { shippingAddressId, billingAddressId, couponCode?, paymentProofUrl? }
 *
 * Creates an order paid by manual bank transfer. Status starts as
 * "PENDING" / paymentStatus "PENDING (verification)" until an admin
 * reviews the uploaded proof and marks it paid.
 */
export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.manualPaymentEnabled) {
    return NextResponse.json({ error: "Manual payment is not available." }, { status: 400 });
  }

  const { shippingAddressId, billingAddressId, couponCode, paymentProofUrl } = await req.json();
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

  let shippingCost =
    settings.freeShippingOver && subtotal >= Number(settings.freeShippingOver)
      ? 0
      : Number(settings.flatShippingRate || 0);

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
      paymentProofUrl: paymentProofUrl || null,
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
      statusHistory: {
        create: {
          status: "PENDING",
          note: paymentProofUrl
            ? "Order created — manual bank transfer, awaiting proof verification"
            : "Order created — manual bank transfer, no proof uploaded yet",
        },
      },
    },
  });

  await prisma.payment.create({
    data: { orderId: order.id, provider: "manual", amount: total, status: "PENDING" },
  });

  if (appliedCouponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: appliedCouponCode } });
    if (coupon) {
      await prisma.couponUsage.create({ data: { couponId: coupon.id, userId, orderId: order.id } });
    }
  }

  // Empty the cart now that the order has been placed.
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
}
