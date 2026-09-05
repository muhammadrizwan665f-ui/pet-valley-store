import { getPrisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface ShopSearchParams {
  q?: string;
  category?: string;
  pet?: string; // "dog" | "cat" | "both"
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  inStock?: string;
  sort?: string;
  page?: string;
}

function buildOrderBy(sort?: string): any {
  switch (sort) {
    case "newest":
      return { createdAt: "desc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    default:
      return { createdAt: "desc" }; // "featured" fallback
  }
}

export default async function ShopPage({ searchParams: searchParamsPromise }: { searchParams: Promise<ShopSearchParams> }) {
  const searchParams = await searchParamsPromise;
  const prisma = await getPrisma();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const where: any = {
    isPublished: true,
    // NOTE: SQLite/D1 has no case-insensitive `mode` option like Postgres —
    // `contains` here is case-sensitive. `tags` is stored as a JSON string
    // (see schema.prisma), so this is a substring match, not an array "has".
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q } },
        { tags: { contains: searchParams.q } },
      ],
    }),
    ...(searchParams.category && { category: { slug: searchParams.category } }),
    ...(searchParams.pet && searchParams.pet !== "both" && { petType: searchParams.pet }),
    ...(searchParams.inStock === "true" && { stock: { gt: 0 } }),
    ...((searchParams.minPrice || searchParams.maxPrice) && {
      price: {
        ...(searchParams.minPrice && { gte: parseFloat(searchParams.minPrice) }),
        ...(searchParams.maxPrice && { lte: parseFloat(searchParams.maxPrice) }),
      },
    }),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { take: 1 }, reviews: true },
      orderBy: buildOrderBy(searchParams.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true } }),
  ]);

  // "rating" and "best-selling" sorts need post-fetch computation since
  // Prisma can't order directly by an aggregated relation average here.
  let visible = products.map((p: any) => ({
    ...p,
    avgRating: p.reviews.length ? p.reviews.reduce((s: any, r: any) => s + r.rating, 0) / p.reviews.length : 0,
  }));
  if (searchParams.rating) {
    visible = visible.filter((p: any) => p.avgRating >= parseFloat(searchParams.rating!));
  }
  if (searchParams.sort === "rating") {
    visible = visible.sort((a: any, b: any) => b.avgRating - a.avgRating);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Shop All</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        {/* FILTER SIDEBAR — server-rendered form, no client JS required to filter */}
        <form className="space-y-6 text-sm" action="/shop" method="get">
          <input type="text" name="q" defaultValue={searchParams.q} placeholder="Search products…" className="w-full rounded-lg border border-sage-200 px-3 py-2" />

          <div>
            <p className="mb-2 font-medium text-charcoal">Pet</p>
            {["dog", "cat", "both"].map((pet: any) => (
              <label key={pet} className="flex items-center gap-2 capitalize">
                <input type="radio" name="pet" value={pet} defaultChecked={searchParams.pet === pet} /> {pet}
              </label>
            ))}
          </div>

          <div>
            <p className="mb-2 font-medium text-charcoal">Category</p>
            {categories.map((c: any) => (
              <label key={c.id} className="flex items-center gap-2">
                <input type="radio" name="category" value={c.slug} defaultChecked={searchParams.category === c.slug} /> {c.name}
              </label>
            ))}
          </div>

          <div>
            <p className="mb-2 font-medium text-charcoal">Price</p>
            <div className="flex gap-2">
              <input type="number" name="minPrice" placeholder="Min" defaultValue={searchParams.minPrice} className="w-1/2 rounded-lg border border-sage-200 px-2 py-1" />
              <input type="number" name="maxPrice" placeholder="Max" defaultValue={searchParams.maxPrice} className="w-1/2 rounded-lg border border-sage-200 px-2 py-1" />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="inStock" value="true" defaultChecked={searchParams.inStock === "true"} /> In stock only
          </label>

          <div>
            <p className="mb-2 font-medium text-charcoal">Sort by</p>
            <select name="sort" defaultValue={searchParams.sort || "featured"} className="w-full rounded-lg border border-sage-200 px-2 py-2">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <button type="submit" className="w-full rounded-xl bg-sage-500 py-2 text-white">Apply Filters</button>
        </form>

        {/* RESULTS */}
        <div>
          <p className="mb-4 text-sm text-charcoal-light">{total} products</p>
          {visible.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-sm text-charcoal-light">
              No products match these filters. Try broadening your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {visible.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: Number(p.price),
                    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                    rating: p.avgRating,
                    reviewCount: p.reviews.length,
                    imageUrl: p.images[0]?.url || "/images/placeholder-product.jpg",
                  }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }).map((_: any, i: any) => (
                <a
                  key={i}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(i + 1) } as any)}`}
                  className={`rounded-lg px-3 py-1 ${page === i + 1 ? "bg-sage-500 text-white" : "border border-sage-200"}`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
