"use client";

import { useEffect, useState } from "react";

export default function AdminShippingPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then(setForm); }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ freeShippingOver: form.freeShippingOver, flatShippingRate: form.flatShippingRate }) });
    setSaving(false);
  };

  if (!form) return <p className="text-sm text-[#6b7280]">Loading…</p>;

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Shipping</h1>
      <p className="text-sm text-[#6b7280]">
        No live carrier is connected yet. Set <code>SHIPPING_PROVIDER</code> in your environment and implement a rate
        adapter to pull real-time carrier rates — until then, the flat rate below applies at checkout.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium">Flat Shipping Rate ($)</label>
        <input type="number" value={form.flatShippingRate ?? ""} onChange={(e) => setForm({ ...form, flatShippingRate: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Free Shipping Over ($)</label>
        <input type="number" value={form.freeShippingOver ?? ""} onChange={(e) => setForm({ ...form, freeShippingOver: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
      </div>
      <button onClick={save} disabled={saving} className="rounded-lg bg-sage-500 px-4 py-2 text-sm text-white">{saving ? "Saving…" : "Save"}</button>
    </div>
  );
}
