import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reviews
 * Lets an admin/staff member add a review on behalf of any named reviewer,
 * for any product, with no limit. Uses the admin's own account for the
 * required FK, but always displays `authorName` instead.
 */
export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { productId, authorName, rating, title, body } = await req.json();
  if (!productId || !authorName || !rating) {
    return NextResponse.json({ error: "productId, authorName and rating are required" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId: (session!.user as any).id,
      authorName,
      rating: Math.max(1, Math.min(5, Number(rating))),
      title: title || null,
      body: body || null,
      status: "APPROVED",
    },
  });
  return NextResponse.json(review, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json(); // status: "APPROVED" | "REJECTED"
  const review = await prisma.review.update({ where: { id }, data: { status } });
  return NextResponse.json(review);
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
