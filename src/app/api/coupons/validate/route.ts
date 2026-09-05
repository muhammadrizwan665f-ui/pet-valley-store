import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const { code, subtotal } = await req.json();

  const coupon = await prisma.coupon.findUnique({ where: { code: (code || "").toUpperCase() } });
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid or inactive coupon code." }, { status: 400 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
  }
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return NextResponse.json({ error: `Minimum order of $${Number(coupon.minOrderValue).toFixed(2)} required.` }, { status: 400 });
  }

  let discount = 0;
  let freeShipping = false;
  if (coupon.type === "PERCENTAGE") {
    discount = subtotal * (Number(coupon.amount) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else if (coupon.type === "FIXED") {
    discount = Math.min(Number(coupon.amount), subtotal);
  } else if (coupon.type === "FREE_SHIPPING") {
    freeShipping = true;
  }

  return NextResponse.json({ code: coupon.code, discount, freeShipping });
}
