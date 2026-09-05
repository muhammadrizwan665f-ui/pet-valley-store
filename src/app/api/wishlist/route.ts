import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const items = await prisma.wishlistItem.findMany({
    where: { userId: (session.user as any).id },
    include: { product: { include: { images: { take: 1 }, reviews: true } } },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { productId } = await req.json();
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: (session.user as any).id, productId } },
    create: { userId: (session.user as any).id, productId },
    update: {},
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { productId } = await req.json();
  await prisma.wishlistItem.delete({ where: { userId_productId: { userId: (session.user as any).id, productId } } });
  return NextResponse.json({ ok: true });
}
