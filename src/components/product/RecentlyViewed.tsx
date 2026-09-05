"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";

const STORAGE_KEY = "pv_recently_viewed";
const MAX_ITEMS = 8;

interface ViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
}

/** Records the current product as viewed (call once on product page mount). */
export function trackRecentlyViewed(product: ViewedProduct) {
  if (typeof window === "undefined") return;
  const existing: ViewedProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const filtered = existing.filter((p) => p.id !== product.id);
  const updated = [product, ...filtered].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function RecentlyViewed({ excludeId }: { excludeId: string }) {
  const [items, setItems] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const stored: ViewedProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setItems(stored.filter((p) => p.id !== excludeId));
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl text-charcoal">Recently Viewed</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={{ ...p, rating: 0, reviewCount: 0 }} />
        ))}
      </div>
    </section>
  );
}
