"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [form, setForm] = useState({ fullName: "", line1: "", city: "", postalCode: "", country: "", phone: "" });

  const load = () => fetch("/api/account/addresses").then((r) => r.json()).then(setAddresses);
  useEffect(() => { load(); }, []);

  const add = async () => {
    await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ fullName: "", line1: "", city: "", postalCode: "", country: "", phone: "" });
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/account/addresses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Addresses</h1>

      <ul className="mt-6 space-y-3">
        {addresses.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm text-sm">
            <span>{a.fullName}, {a.line1}, {a.city} {a.postalCode}, {a.country}</span>
            <button onClick={() => remove(a.id)} className="text-red-600">Remove</button>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium">Add a new address</p>
        <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <input placeholder="Address line" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-1/2 rounded-lg border border-sage-200 px-3 py-2 text-sm" />
          <input placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-1/2 rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        </div>
        <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <Button variant="primary" onClick={add}>Save Address</Button>
      </div>
    </main>
  );
}
