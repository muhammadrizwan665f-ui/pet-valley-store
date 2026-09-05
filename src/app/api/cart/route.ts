import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@/generated/prisma";

export const dynamic = "force-dynamic";

async function getOrCreateCart(prisma: PrismaClient, userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: { include: { product: { include: { images: true } }, variant: true } } },
  });
}

export async function GET() {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ items: [] });
  const cart = await getOrCreateCart(prisma, (session.user as any).id);
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { productId, variantId, quantity = 1 } = await req.json();
  const userId = (session.user as any).id as string;
  const cart = await getOrCreateCart(prisma, userId);

  const existing = cart.items.find((i: any) => i.productId === productId && i.variantId === (variantId ?? null));

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity } });
  }

  const updated = await getOrCreateCart(prisma, userId);
  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { itemId, quantity } = await req.json();
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  const updated = await getOrCreateCart(prisma, (session.user as any).id);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { itemId } = await req.json();
  await prisma.cartItem.delete({ where: { id: itemId } });
  const updated = await getOrCreateCart(prisma, (session.user as any).id);
  return NextResponse.json(updated);
}
