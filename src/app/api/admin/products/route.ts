import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { encodeStringArray } from "@/lib/json";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return role === "ADMIN" || role === "STAFF";
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      categoryId: body.categoryId,
      petType: body.petType,
      description: body.description,
      features: encodeStringArray(body.features),
      price: body.price,
      compareAtPrice: body.compareAtPrice || null,
      sku: body.sku,
      stock: body.stock ?? 0,
      lowStockAt: body.lowStockAt ?? 5,
      tags: encodeStringArray(body.tags),
      isPublished: body.isPublished ?? false,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      images: { create: (body.images || []).map((url: string, i: number) => ({ url, sortOrder: i })) },
    },
  });

  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, ...rest } = await req.json();
  const product = await prisma.product.update({ where: { id }, data: rest });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
