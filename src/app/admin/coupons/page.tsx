"use client";

import { useEffect, useState } from "react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", amount: "10", minOrderValue: "", maxDiscount: "", usageLimit: "", expiresAt: "" });

  const load = () => fetch("/api/admin/coupons").then((r) => r.json()).then(setCoupons);
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ code: "", type: "PERCENTAGE", amount: "10", minOrderValue: "", maxDiscount: "", usageLimit: "", expiresAt: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    await fetch("/api/admin/coupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Coupons</h1>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow-sm">
        <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm">
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed amount</option>
          <option value="FREE_SHIPPING">Free shipping</option>
        </select>
        <input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <input placeholder="Min order value" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <input placeholder="Usage limit" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <input placeholder="Expires" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <button onClick={create} className="col-span-2 rounded-lg bg-sage-500 px-3 py-1.5 text-sm text-white">Create Coupon</button>
      </div>

      <ul className="mt-4 divide-y divide-[#f0f2f4] rounded-xl bg-white shadow-sm">
        {coupons.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3 text-sm">
            <span>{c.code} — {c.type} {c.amount}{c.type === "PERCENTAGE" ? "%" : ""} · used {c.timesUsed}{c.usageLimit ? `/${c.usageLimit}` : ""}</span>
            <button onClick={() => remove(c.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
