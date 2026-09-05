"use client";

import { useState } from "react";
import PayFastCheckoutRedirect from "@/components/checkout/PayFastCheckoutRedirect";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const [addressId, setAddressId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", line1: "", city: "", postalCode: "", country: "", phone: "" });
  const [placing, setPlacing] = useState(false);

  const saveAddressAndProceed = async () => {
    setPlacing(true);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const address = await res.json();
    setAddressId(address.id);
  };

  if (addressId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <PayFastCheckoutRedirect shippingAddressId={addressId} billingAddressId={addressId} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Checkout</h1>
      <div className="mt-6 space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium">Shipping Address</p>
        <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <input placeholder="Address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-1/2 rounded-lg border border-sage-200 px-3 py-2 text-sm" />
          <input placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-1/2 rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        </div>
        <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <Button variant="primary" className="w-full" onClick={saveAddressAndProceed} disabled={placing}>
          {placing ? "Saving…" : "Continue to Payment"}
        </Button>
      </div>
    </main>
  );
}
