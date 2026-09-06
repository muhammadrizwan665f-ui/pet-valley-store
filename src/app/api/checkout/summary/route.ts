import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout/summary
 * Returns the current cart's line items plus a computed price breakdown
 * (subtotal, shipping, tax, total) so the checkout page can show the
 * customer exactly what they're paying — including shipping — before
 * they're redirected to PayFast.
 */
export async function GET(req: Request) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const couponCode = searchParams.get("coupon");

  const userId = (session.user as any).id as string;
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, variant: true } } },
  });

  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });

  const items = (cart?.items || []).map((item: any) => {
    const unitPrice = Number(item.product.price) + Number(item.variant?.priceDelta || 0);
    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      imageUrl: item.variant?.imageUrl || item.product.images[0]?.url || "/images/placeholder-product.jpg",
      variant: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum: number, i: any) => sum + i.lineTotal, 0);
  const freeShippingOver = settings?.freeShippingOver ? Number(settings.freeShippingOver) : null;
  let shipping = freeShippingOver && subtotal >= freeShippingOver ? 0 : Number(settings?.flatShippingRate || 0);
  const taxRatePercent = Number(settings?.taxRatePercent || 0);
  const tax = (subtotal * taxRatePercent) / 100;

  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) &&
      (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue));
    if (valid && coupon) {
      appliedCoupon = coupon.code;
      if (coupon.type === "PERCENTAGE") {
        discount = subtotal * (Number(coupon.amount) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      } else if (coupon.type === "FIXED") {
        discount = Math.min(Number(coupon.amount), subtotal);
      } else if (coupon.type === "FREE_SHIPPING") {
        shipping = 0;
      }
    }
  }

  const total = subtotal + shipping + tax - discount;

  return NextResponse.json({
    items,
    subtotal,
    shipping,
    freeShippingOver,
    taxRatePercent,
    tax,
    discount,
    appliedCoupon,
    total,
    currency: settings?.currency || "USD",
  });
}
