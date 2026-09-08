"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/components/ui/Toast";

type MediaItem = { url: string; type: "image" | "video" };
type Variant = { id: string; name: string; value: string; imageUrl?: string | null; images?: string[]; priceDelta?: number; stock?: number };

function dedupe(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.url)) return false;
    seen.add(i.url);
    return true;
  });
}

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
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const openCart = useCartStore((s) => s.openCart);
  const { show } = useToast();

  const selectedVariant = variants.find((v) => v.id === variantId);
  const variantImages: MediaItem[] = (
    selectedVariant?.images?.length ? selectedVariant.images : selectedVariant?.imageUrl ? [selectedVariant.imageUrl] : []
  ).map((url) => ({ url, type: "image" as const }));

  // The selected colour's own photos lead the gallery, but the product's
  // general photos/videos are always included too (and always shown when
  // no colour-specific photos exist) — previously the colour's images
  // fully replaced the general ones, so the general photos never appeared
  // at all once any colour with a photo existed.
  const gallery = useMemo(() => {
    const combined = dedupe([...variantImages, ...images]);
    return combined.length ? combined : [{ url: "/images/placeholder-product.jpg", type: "image" as const }];
  }, [variantImages, images]);

  useEffect(() => {
    setIndex(0);
    setDirection(0);
  }, [variantId]);

  useEffect(() => {
    if (index >= gallery.length) setIndex(0);
  }, [gallery.length, index]);

  const active = gallery[index] ?? gallery[0];
  const price = basePrice + Number(selectedVariant?.priceDelta || 0);
  const outOfStockForVariant = selectedVariant ? (selectedVariant.stock ?? 1) <= 0 : !inStock;

  const goTo = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + gallery.length) % gallery.length);
  };

  const onDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -60) goTo(index + 1);
    else if (info.offset.x > 60) goTo(index - 1);
  };

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
        <div className="group relative aspect-square touch-pan-y overflow-hidden rounded-2xl bg-sage-50">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={active.url}
              custom={direction}
              initial={{ x: direction >= 0 ? 60 : -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -60 : 60, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              drag={gallery.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              className="absolute inset-0"
            >
              {active.type === "video" ? (
                <video src={active.url} controls playsInline className="h-full w-full object-cover" />
              ) : (
                <Image src={active.url} alt={productName} fill priority className="pointer-events-none object-cover" />
              )}
            </motion.div>
          </AnimatePresence>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goTo(index - 1)}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => goTo(index + 1)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to image ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((m, i) => (
              <button
                key={m.url + i}
                type="button"
                onClick={() => goTo(i)}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50 ring-2 transition-colors ${
                  i === index ? "ring-sage-500" : "ring-transparent"
                }`}
              >
                {m.type === "video" ? (
                  <>
                    <video src={m.url} className="h-full w-full object-cover" muted />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs text-white">▶</span>
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
                    onClick={() => setVariantId(v.id)}
                    title={v.value}
                    className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-colors ${
                      variantId === v.id ? "border-sage-500" : "border-transparent"
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
