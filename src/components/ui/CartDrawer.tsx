"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/lib/cartStore";
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "./Button";

export function CartDrawer() {
  const { isOpen, closeCart } = useCartStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/cart").then((r) => r.json()).then((data) => setItems(data.items || [])).finally(() => setLoading(false));
    }
  }, [isOpen]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
    const data = await res.json();
    setItems(data.items || []);
  };

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.product?.price || 0) + parseFloat(i.variant?.priceDelta || 0)) * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-sage-100 p-4">
              <h2 className="font-display text-lg">Your Cart</h2>
              <button onClick={closeCart} aria-label="Close cart"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-sage-50" />)}
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-charcoal-light">Your cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div key={item.id} layout className="flex items-center gap-3 rounded-lg bg-sage-50/50 p-2">
                      <img src={item.product?.images?.[0]?.url || "/images/placeholder-product.jpg"} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{item.product?.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button onClick={() => updateQuantity(item.id, 0)} aria-label="Remove"><Trash2 size={14} /></button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-sage-100 p-4">
              <div className="mb-3 flex justify-between text-sm font-semibold">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <a href="/checkout"><Button variant="primary" className="w-full">Checkout</Button></a>
              <a href="/cart" onClick={closeCart} className="mt-2 block text-center text-xs text-charcoal-light underline">View full cart</a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
