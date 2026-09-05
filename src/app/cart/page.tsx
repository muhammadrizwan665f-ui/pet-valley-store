"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface CartLine {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: string; images: { url: string }[] };
  variant?: { name: string; value: string; priceDelta: string } | null;
}

const FREE_SHIPPING_THRESHOLD = 50; // mirrors StoreSettings.freeShippingOver; kept simple here

export default function CartPage() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; freeShipping: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    setItems((prev) => (quantity <= 0 ? prev.filter((i) => i.id !== itemId) : prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))));
    const res = await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
    const data = await res.json();
    setItems(data.items || []);
  };

  const subtotal = items.reduce((sum, i) => {
    const unit = parseFloat(i.product.price) + parseFloat(i.variant?.priceDelta || "0");
    return sum + unit * i.quantity;
  }, 0);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const applyCoupon = async () => {
    setCouponError(null);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCouponError(data.error);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(data);
    sessionStorage.setItem("pv_coupon", data.code);
  };

  const total = subtotal - (appliedCoupon?.discount || 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-32 animate-pulse rounded-xl bg-sage-50" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Your Cart</h1>

      {/* FREE SHIPPING PROGRESS */}
      <div className="mt-6 rounded-xl bg-sage-50 p-4">
        <p className="text-sm text-charcoal">
          {remainingForFreeShipping > 0
            ? `Add $${remainingForFreeShipping.toFixed(2)} more for free shipping!`
            : "You've unlocked free shipping 🎉"}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sage-100">
          <motion.div
            className="h-full bg-sage-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-12 text-center text-charcoal-light">Your cart is empty.</p>
      ) : (
        <div className="mt-6 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm"
              >
                <img src={item.product.images[0]?.url || "/images/placeholder-product.jpg"} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{item.product.name}</p>
                  {item.variant && <p className="text-xs text-charcoal-light">{item.variant.name}: {item.variant.value}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded border px-2">-</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded border px-2">+</button>
                  </div>
                </div>
                <p className="text-sm font-semibold">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                <button onClick={() => updateQuantity(item.id, 0)} aria-label="Remove item">
                  <Trash2 size={16} className="text-charcoal-light" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="mt-8 space-y-2 border-t border-sage-100 pt-4">
            <div className="flex gap-2">
              <input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 rounded-lg border border-sage-200 px-3 py-2 text-sm"
              />
              <button onClick={applyCoupon} className="rounded-lg border border-sage-300 px-4 py-2 text-sm">Apply</button>
            </div>
            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-xs text-sage-600">
                "{appliedCoupon.code}" applied {appliedCoupon.freeShipping ? "— free shipping" : `— -$${appliedCoupon.discount.toFixed(2)}`}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-between text-sm text-charcoal-light">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {appliedCoupon && !appliedCoupon.freeShipping && (
            <div className="flex justify-between text-sm text-sage-600">
              <span>Discount</span>
              <span>-${appliedCoupon.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-sage-100 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <a href="/checkout">
            <Button variant="primary" className="mt-4 w-full">Proceed to Checkout</Button>
          </a>
        </div>
      )}
    </main>
  );
}
