"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "./RecentlyViewed";

export function TrackViewed({
  product,
}: {
  product: { id: string; name: string; slug: string; price: number; compareAtPrice: number | null; imageUrl: string };
}) {
  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product.id]);

  return null;
}
