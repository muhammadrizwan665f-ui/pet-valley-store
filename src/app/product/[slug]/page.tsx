import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { TrackViewed } from "@/components/product/TrackViewed";
import { ProductCard } from "@/components/ui/ProductCard";
import { decodeStringArray } from "@/lib/json";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prisma = await getPrisma();
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description.slice(0, 160),
    openGraph: { title: product.name, description: product.description.slice(0, 160) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prisma = await getPrisma();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, reviews: { where: { status: "APPROVED" }, include: { user: true } }, category: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isPublished: true },
    include: { images: { take: 1 }, reviews: true },
    take: 4,
  });

  const avgRating = product.reviews.length ? product.reviews.reduce((s: any, r: any) => s + r.rating, 0) / product.reviews.length : 0;

  // JSON-LD structured data for SEO
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i: any) => i.url),
    offers: { "@type": "Offer", price: product.price.toString(), priceCurrency: "USD", availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    aggregateRating: product.reviews.length ? { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: product.reviews.length } : undefined,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <TrackViewed
        product={{
          id: product.id, name: product.name, slug: product.slug, price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          imageUrl: product.images[0]?.url || "/images/placeholder-product.jpg",
        }}
      />

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage-50">
            <Image src={product.images[0]?.url || "/images/placeholder-product.jpg"} alt={product.name} fill className="object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((img: any) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-sage-50">
                <Image src={img.url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl text-charcoal">{product.name}</h1>
          <p className="mt-1 text-sm text-charcoal-light">★ {avgRating.toFixed(1)} ({product.reviews.length} reviews)</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">${Number(product.price).toFixed(2)}</span>
            {product.compareAtPrice && <span className="text-charcoal-light line-through">${Number(product.compareAtPrice).toFixed(2)}</span>}
          </div>

          <p className="mt-2 text-sm text-charcoal-light">{product.stock > 0 ? "In stock" : "Out of stock"}</p>

          <AddToCartPanel
            productId={product.id}
            variants={product.variants.map((v: any) => ({ id: v.id, name: v.name, value: v.value }))}
            inStock={product.stock > 0}
          />

          <p className="mt-6 text-sm leading-relaxed text-charcoal-light">{product.description}</p>

          {decodeStringArray(product.features).length > 0 && (
            <ul className="mt-4 list-disc pl-5 text-sm text-charcoal-light">
              {decodeStringArray(product.features).map((f: any, i: any) => <li key={i}>{f}</li>)}
            </ul>
          )}

          <div className="mt-6 space-y-1 text-xs text-charcoal-light">
            <p>✓ Free shipping on qualifying orders</p>
            <p>✓ 30-day easy returns</p>
            <p>✓ Secure PayFast checkout</p>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-charcoal">Reviews</h2>
        <div className="mt-4 space-y-4">
          {product.reviews.length === 0 && <p className="text-sm text-charcoal-light">No reviews yet.</p>}
          {product.reviews.map((r: any) => (
            <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm font-medium">{"★".repeat(r.rating)}</p>
              <p className="text-sm text-charcoal-light">{r.title} {r.body}</p>
              <p className="mt-1 text-xs text-charcoal-light">— {r.user.firstName}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-charcoal">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id, name: p.name, slug: p.slug, price: Number(p.price),
                  compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                  rating: p.reviews.length ? p.reviews.reduce((s: any, r: any) => s + r.rating, 0) / p.reviews.length : 0,
                  reviewCount: p.reviews.length, imageUrl: p.images[0]?.url || "/images/placeholder-product.jpg",
                }}
              />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </main>
  );
}
