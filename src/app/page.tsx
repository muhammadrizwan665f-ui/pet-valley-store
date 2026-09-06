import { getPrisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const prisma = await getPrisma();
  const [bestSellers, settings, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      include: { images: { take: 1 }, reviews: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.storeSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.category.findMany({ where: { isActive: true, imageUrl: { not: null } }, orderBy: { sortOrder: "asc" }, take: 12 }).catch(() => []),
  ]);

  const heroImage = settings?.heroImageUrl;
  const heroImageMobile = settings?.heroImageMobileUrl || settings?.heroImageUrl;
  const heroTitle = settings?.heroTitle || "Everything They Love.";
  const heroSubtitle = settings?.heroSubtitle || "Thoughtfully chosen products for happier, healthier pets.";
  const heroCtaText = settings?.heroCtaText || "Shop Dogs";
  const heroCtaLink = settings?.heroCtaLink || "/dogs";

  return (
    <main className="bg-cream">
      {/* HERO */}
      <section className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-sage-50 px-4 text-center sm:aspect-[16/9] md:min-h-[80vh] md:aspect-auto">
        {heroImageMobile && (
          <Image src={heroImageMobile} alt="" fill priority className="object-cover sm:hidden" />
        )}
        {heroImage && (
          <Image src={heroImage} alt="" fill priority className="hidden object-cover sm:block" />
        )}
        {heroImage && <div className="absolute inset-0 bg-black/35" />}
        <div className={`relative z-10 max-w-2xl animate-fade-up ${heroImage ? "text-white" : ""}`}>
          <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl ${heroImage ? "text-white" : "text-charcoal"}`}>{heroTitle}</h1>
          <p className={`mt-4 text-base sm:text-lg ${heroImage ? "text-white/90" : "text-charcoal-light"}`}>
            {heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link href={heroCtaLink}><Button variant="primary">{heroCtaText}</Button></Link>
            <Link href="/cats"><Button variant="secondary">Shop Cats</Button></Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-sage-100 bg-white py-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center text-sm text-charcoal-light md:grid-cols-4">
          <span>Free Shipping</span>
          <span>Easy Returns</span>
          <span>Secure Checkout</span>
          <span>Pet-Lover Approved</span>
        </div>
      </section>

      {/* SHOP BY CATEGORY (fully admin-managed — name, image, sort order) */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-3xl text-charcoal">Shop by Category</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
            {categories.map((c: any) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sage-100 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-sage-50">
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="border-t border-sage-100 px-3 py-3 text-center">
                  <span className="text-sm font-semibold text-charcoal">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl text-charcoal">Best Sellers</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {bestSellers.map((p: any) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: Number(p.price),
                compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                rating: p.reviews.length ? p.reviews.reduce((s: any, r: any) => s + r.rating, 0) / p.reviews.length : 0,
                reviewCount: p.reviews.length,
                imageUrl: p.images[0]?.url || "/images/placeholder-product.jpg",
              }}
            />
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-sage-500 py-16 text-center text-white">
        <h2 className="font-display text-3xl">Join the Pet Valley Family</h2>
        <p className="mt-2 text-sage-100">Get early access to new arrivals and offers.</p>
        <form className="mx-auto mt-6 flex max-w-md gap-2 px-4">
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 rounded-xl border-0 px-4 py-3 text-charcoal focus:outline-none"
          />
          <Button variant="secondary">Subscribe</Button>
        </form>
      </section>
    </main>
  );
}
