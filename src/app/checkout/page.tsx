"use client";

import { useEffect, useState } from "react";
import PayFastCheckoutRedirect from "@/components/checkout/PayFastCheckoutRedirect";
import { Button } from "@/components/ui/Button";

type Summary = {
  items: { id: string; name: string; imageUrl: string; variant: string | null; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  freeShippingOver: number | null;
  taxRatePercent: number;
  tax: number;
  discount: number;
  appliedCoupon: string | null;
  total: number;
  currency: string;
};

export default function CheckoutPage() {
  const [step, setStep] = useState<"review" | "address" | "pay">("review");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", line1: "", city: "", postalCode: "", country: "", phone: "" });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const coupon = typeof window !== "undefined" ? sessionStorage.getItem("pv_coupon") : null;
    const qs = coupon ? `?coupon=${encodeURIComponent(coupon)}` : "";
    fetch(`/api/checkout/summary${qs}`)
      .then((r) => r.json())
      .then(setSummary);
  }, []);

  const saveAddressAndProceed = async () => {
    setPlacing(true);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const address = await res.json();
    setAddressId(address.id);
    setStep("pay");
  };

  const money = (n: number) => `$${n.toFixed(2)}`;

  if (step === "pay" && addressId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <PayFastCheckoutRedirect shippingAddressId={addressId} billingAddressId={addressId} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Checkout</h1>

      {/* Step indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-charcoal-light">
        <span className={step === "review" ? "text-sage-600" : ""}>1. Review Order</span>
        <span>→</span>
        <span className={step === "address" ? "text-sage-600" : ""}>2. Shipping Address</span>
        <span>→</span>
        <span>3. Payment</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {step === "review" && (
            <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium">Your Order</p>
              {!summary && <p className="text-sm text-charcoal-light">Loading…</p>}
              {summary && summary.items.length === 0 && <p className="text-sm text-charcoal-light">Your cart is empty.</p>}
              {summary?.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-sage-100 pb-3 last:border-0">
                  <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{item.name}</p>
                    {item.variant && <p className="text-xs text-charcoal-light">{item.variant}</p>}
                    <p className="text-xs text-charcoal-light">Qty {item.quantity} × {money(item.unitPrice)}</p>
                  </div>
                  <p className="text-sm font-medium">{money(item.lineTotal)}</p>
                </div>
              ))}
              {summary && summary.items.length > 0 && (
                <Button variant="primary" className="w-full" onClick={() => setStep("address")}>
                  Continue to Shipping
                </Button>
              )}
            </div>
          )}

          {step === "address" && (
            <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium">Shipping Address</p>
              <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
              <input placeholder="Address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-1/2 rounded-lg border border-sage-200 px-3 py-2 text-sm" />
                <input placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-1/2 rounded-lg border border-sage-200 px-3 py-2 text-sm" />
              </div>
              <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep("review")}>Back</Button>
                <Button variant="primary" className="flex-1" onClick={saveAddressAndProceed} disabled={placing}>
                  {placing ? "Saving…" : "Continue to Payment"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Price summary sidebar — always visible so shipping is never a surprise */}
        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium">Order Summary</p>
          {summary && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-charcoal-light">
                <span>Subtotal</span>
                <span>{money(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal-light">
                <span>Shipping</span>
                <span>{summary.shipping === 0 ? "FREE" : money(summary.shipping)}</span>
              </div>
              {summary.taxRatePercent > 0 && (
                <div className="flex justify-between text-charcoal-light">
                  <span>Tax ({summary.taxRatePercent}%)</span>
                  <span>{money(summary.tax)}</span>
                </div>
              )}
              {summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {summary.appliedCoupon ? `(${summary.appliedCoupon})` : ""}</span>
                  <span>-{money(summary.discount)}</span>
                </div>
              )}
              {summary.freeShippingOver && summary.shipping > 0 && (
                <p className="text-xs text-sage-600">
                  Add {money(summary.freeShippingOver - summary.subtotal)} more for free shipping!
                </p>
              )}
              <div className="flex justify-between border-t border-sage-100 pt-2 text-base font-semibold text-charcoal">
                <span>Total</span>
                <span>{money(summary.total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
