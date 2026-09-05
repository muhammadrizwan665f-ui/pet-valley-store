import { getPrisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/ProductCard";

export async function PetCategoryPage({ petType, title }: { petType: "dog" | "cat"; title: string }) {
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    where: { isPublished: true, petType: { in: [petType, "both"] } },
    include: { images: { take: 1 }, reviews: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">{title}</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p: any) => (
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
    </main>
  );
}
