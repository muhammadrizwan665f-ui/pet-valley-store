"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Button } from "./Button";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "./Toast";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const { show } = useToast();
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : null;

  const toggleWishlist = async () => {
    const next = !wished;
    setWished(next);
    await fetch("/api/wishlist", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
  };

  const addToCart = async () => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    if (res.ok) {
      setAdded(true);
      show("Added to cart", "success");
      openCart();
      setTimeout(() => setAdded(false), 1200);
    } else {
      show("Please sign in to add items to your cart", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl bg-white p-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-sage-50">
        <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full w-full">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </motion.div>

        {discount && (
          <span className="absolute left-2 top-2 rounded-full bg-sage-500 px-2 py-1 text-xs font-medium text-white">
            -{discount}%
          </span>
        )}

        <motion.button
          aria-label="Add to wishlist"
          onClick={toggleWishlist}
          whileTap={{ scale: 0.8 }}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm"
        >
          <motion.span animate={wished ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
            <Heart size={16} className={wished ? "fill-sage-500 text-sage-500" : "text-charcoal-light"} />
          </motion.span>
        </motion.button>
      </div>

      <div className="mt-3 space-y-1">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-charcoal">{product.name}</p>
        <p className="text-xs text-charcoal-light">
          ★ {product.rating.toFixed(1)} ({product.reviewCount})
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-charcoal">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-charcoal-light line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
        </div>
      </div>

      <Button
        variant="secondary"
        className="mt-3 w-full"
        onClick={addToCart}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              Added ✓
            </motion.span>
          ) : (
            <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
              <ShoppingBag size={14} /> Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
