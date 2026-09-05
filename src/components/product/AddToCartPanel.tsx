"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/components/ui/Toast";

export function AddToCartPanel({
  productId,
  variants,
  inStock,
}: {
  productId: string;
  variants: { id: string; name: string; value: string }[];
  inStock: boolean;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const { show } = useToast();

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
    <div className="mt-6 space-y-4">
      {variants.length > 0 && (
        <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className="rounded-lg border border-sage-200 px-3 py-2 text-sm">
          {variants.map((v) => <option key={v.id} value={v.id}>{v.name}: {v.value}</option>)}
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
        <Button variant="primary" disabled={!inStock} onClick={addToCart}>
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Added ✓</motion.span>
            ) : (
              <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Add to Cart</motion.span>
            )}
          </AnimatePresence>
        </Button>
        <a href="/checkout"><Button variant="secondary" disabled={!inStock}>Buy Now</Button></a>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-sage-100 bg-white p-4 md:hidden">
        <Button variant="primary" className="flex-1" disabled={!inStock} onClick={addToCart}>Add to Cart</Button>
      </div>
    </div>
  );
}
