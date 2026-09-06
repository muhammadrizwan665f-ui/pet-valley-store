"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/components/ui/Toast";

type MediaItem = { url: string; type: "image" | "video" };
type Variant = { id: string; name: string; value: string; imageUrl?: string | null; priceDelta?: number; stock?: number };

export function ProductGallery({
  productId,
  images,
  variants,
  basePrice,
  compareAtPrice,
  inStock,
  productName,
  avgRating,
  reviewCount,
  description,
  features,
}: {
  productId: string;
  images: MediaItem[];
  variants: Variant[];
  basePrice: number;
  compareAtPrice: number | null;
  inStock: boolean;
  productName: string;
  avgRating: number;
  reviewCount: number;
  description: string;
  features: string[];
}) {
  const colourVariants = variants.filter((v) => v.imageUrl);
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const { show } = useToast();

  const selectedVariant = variants.find((v) => v.id === variantId);
  const variantMedia: MediaItem | null = selectedVariant?.imageUrl ? { url: selectedVariant.imageUrl, type: "image" } : null;
  const [manualActive, setManualActive] = useState<MediaItem | null>(null);
  const activeMedia: MediaItem =
    manualActive || variantMedia || images[0] || { url: "/images/placeholder-product.jpg", type: "image" };
  const price = basePrice + Number(selectedVariant?.priceDelta || 0);
  const outOfStockForVariant = selectedVariant ? (selectedVariant.stock ?? 1) <= 0 : !inStock;

  const gallery = useMemo(() => {
    // If the selected variant has its own image, show that first, then the
    // rest of the product's normal photo/video set as thumbnails.
    return [activeMedia, ...images.filter((i) => i.url !== activeMedia.url)];
  }, [activeMedia, images]);

  const addToCart = async () => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    if (res.ok) {
      setAdded(true);
      show("Added to cart", "success");
      openCart();
      setTimeout(() => setAdded(false), 1500);
    } else {
      show("Please sign in to add items to your cart", "error");
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMedia.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {activeMedia.type === "video" ? (
                <video src={activeMedia.url} controls playsInline className="h-full w-full object-cover" />
              ) : (
                <Image src={activeMedia.url} alt={productName} fill className="object-cover" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {gallery.slice(1, 5).map((m, i) => (
              <button
                key={m.url + i}
                type="button"
                onClick={() => setManualActive(m)}
                className="relative aspect-square overflow-hidden rounded-lg bg-sage-50"
              >
                {m.type === "video" ? (
                  <>
                    <video src={m.url} className="h-full w-full object-cover" muted />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">▶</span>
                  </>
                ) : (
                  <Image src={m.url} alt="" fill className="object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl text-charcoal">{productName}</h1>
        <p className="mt-1 text-sm text-charcoal-light">★ {avgRating.toFixed(1)} ({reviewCount} reviews)</p>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold">${price.toFixed(2)}</span>
          {compareAtPrice && <span className="text-charcoal-light line-through">${compareAtPrice.toFixed(2)}</span>}
        </div>

        <p className="mt-2 text-sm text-charcoal-light">{outOfStockForVariant ? "Out of stock" : "In stock"}</p>

        <div className="mt-6 space-y-4">
          {colourVariants.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-charcoal">
                {colourVariants[0].name}: <span className="font-normal text-charcoal-light">{selectedVariant?.value}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colourVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVariantId(v.id);
                      setManualActive(null);
                    }}
                    title={v.value}
                    className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-colors ${
                      variantId === v.id && !manualActive ? "border-sage-500" : "border-transparent"
                    } ${(v.stock ?? 1) <= 0 ? "opacity-40" : ""}`}
                  >
                    <Image src={v.imageUrl!} alt={v.value} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {variants.length > 0 && colourVariants.length === 0 && (
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="rounded-lg border border-sage-200 px-3 py-2 text-sm"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}: {v.value}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-sage-200">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2">-</button>
              <span className="px-3">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2">+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" disabled={outOfStockForVariant} onClick={addToCart}>
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Added ✓</motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Add to Cart</motion.span>
                )}
              </AnimatePresence>
            </Button>
            <a href="/checkout"><Button variant="secondary" disabled={outOfStockForVariant}>Buy Now</Button></a>
          </div>

          {/* Sticky mobile add-to-cart bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-sage-100 bg-white p-4 md:hidden">
            <Button variant="primary" className="flex-1" disabled={outOfStockForVariant} onClick={addToCart}>Add to Cart</Button>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-charcoal-light">{description}</p>

        {features.length > 0 && (
          <ul className="mt-4 list-disc pl-5 text-sm text-charcoal-light">
            {features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}

        <div className="mt-6 space-y-1 text-xs text-charcoal-light">
          <p>✓ Free shipping on qualifying orders</p>
          <p>✓ 30-day easy returns</p>
          <p>✓ Secure PayFast checkout</p>
        </div>
      </div>
    </>
  );
}
