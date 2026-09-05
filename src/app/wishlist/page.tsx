"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);

  const load = () => fetch("/api/wishlist").then((r) => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const remove = async (productId: string) => {
    await fetch("/api/wishlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    load();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-8 text-charcoal-light">Your wishlist is empty.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((i) => (
            <div key={i.id} className="relative">
              <ProductCard
                product={{
                  id: i.product.id, name: i.product.name, slug: i.product.slug, price: Number(i.product.price),
                  compareAtPrice: i.product.compareAtPrice ? Number(i.product.compareAtPrice) : null,
                  rating: i.product.reviews.length ? i.product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / i.product.reviews.length : 0,
                  reviewCount: i.product.reviews.length, imageUrl: i.product.images[0]?.url || "/images/placeholder-product.jpg",
                }}
              />
              <button onClick={() => remove(i.product.id)} className="mt-1 w-full text-center text-xs text-red-600 underline">Remove from wishlist</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
