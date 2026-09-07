import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { encodeStringArray, decodeStringArray } from "@/lib/json";
import { slugify } from "@/lib/slugify";

// Product.sku is a required, unique column. The admin form's SKU field is
// optional (many small sellers don't track their own SKUs), so if it's left
// blank we generate a guaranteed-unique one server-side instead of writing
// "" — which previously caused every *second* blank-SKU product to fail
// with a raw unique-constraint 500 error.
function autoSku(): string {
  return `PV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// Turns a Prisma/D1 unique-constraint failure into a clear message instead
// of a bare 500, and lets any other unexpected error still surface (rather
// than fail completely silently) with at least a generic message.
function errorResponse(err: any) {
  const message = String(err?.message || "");
  if (err?.code === "P2002" || /UNIQUE constraint failed/i.test(message)) {
    const field = message.match(/\.(\w+)$/)?.[1] || "a field";
    return NextResponse.json({ error: `That ${field} is already used by another product. Please use a different value.` }, { status: 409 });
  }
  return NextResponse.json({ error: "Could not save the product. Please try again." }, { status: 500 });
}

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

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slugify(body.slug || body.name),
        categoryId: body.categoryId,
        petType: body.petType,
        description: body.description,
        features: encodeStringArray(body.features),
        price: body.price,
        compareAtPrice: body.compareAtPrice || null,
        sku: (body.sku || "").trim() || autoSku(),
        stock: body.stock ?? 0,
        lowStockAt: body.lowStockAt ?? 5,
        tags: encodeStringArray(body.tags),
        isPublished: body.isPublished ?? false,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        images: {
          create: (body.images || []).map((img: any, i: number) => ({
            url: typeof img === "string" ? img : img.url,
            type: typeof img === "string" ? "image" : img.type || "image",
            altText: typeof img === "string" ? null : img.altText || null,
            sortOrder: i,
          })),
        },
        variants: {
          create: (body.variants || []).map((v: any, i: number) => ({
            name: v.name || "Color",
            value: v.value,
            imageUrl: (v.images && v.images[0]) || v.imageUrl || null,
            images: encodeStringArray(v.images || (v.imageUrl ? [v.imageUrl] : [])),
            priceDelta: v.priceDelta ?? 0,
            sku: v.sku || null,
            stock: v.stock ?? 0,
            sortOrder: i,
          })),
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, images, variants, ...rest } = await req.json();
  if (rest.slug) rest.slug = slugify(rest.slug);
  if ("sku" in rest) rest.sku = (rest.sku || "").trim() || autoSku();

  try {
    // Plain scalar fields update normally...
    const product = await prisma.product.update({ where: { id }, data: rest });

    // ...images/variants are relations, so we replace-all rather than trying
    // to diff them (simplest reliable approach for an admin form).
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        await prisma.productImage.createMany({
          data: images.map((img: any, i: number) => ({
            productId: id,
            url: typeof img === "string" ? img : img.url,
            type: typeof img === "string" ? "image" : img.type || "image",
            altText: typeof img === "string" ? null : img.altText || null,
            sortOrder: i,
          })),
        });
      }
    }

    if (Array.isArray(variants)) {
      // Keep variants that already have real orders referencing them intact
      // by only deleting ones that were removed client-side.
      const existing = await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true } });
      const keepIds = new Set(variants.filter((v: any) => v.id).map((v: any) => v.id));
      const toDelete = existing.filter((v: any) => !keepIds.has(v.id)).map((v: any) => v.id);
      if (toDelete.length) {
        await prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } });
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const data = {
          name: v.name || "Color",
          value: v.value,
          imageUrl: (v.images && v.images[0]) || v.imageUrl || null,
          images: encodeStringArray(v.images || (v.imageUrl ? [v.imageUrl] : [])),
          priceDelta: v.priceDelta ?? 0,
          sku: v.sku || null,
          stock: v.stock ?? 0,
          sortOrder: i,
        };
        if (v.id) {
          await prisma.productVariant.update({ where: { id: v.id }, data });
        } else {
          await prisma.productVariant.create({ data: { ...data, productId: id } });
        }
      }
    }

    const full = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json(
      full ? { ...full, variants: full.variants.map((v: any) => ({ ...v, images: decodeStringArray(v.images) })) } : full,
    );
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
