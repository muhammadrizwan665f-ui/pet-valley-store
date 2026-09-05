import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return role === "ADMIN" || role === "STAFF";
}

export async function GET() {
  const prisma = await getPrisma();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type,
      amount: body.amount || 0,
      minOrderValue: body.minOrderValue || null,
      maxDiscount: body.maxDiscount || null,
      usageLimit: body.usageLimit || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, ...rest } = await req.json();
  const coupon = await prisma.coupon.update({ where: { id }, data: rest });
  return NextResponse.json(coupon);
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
