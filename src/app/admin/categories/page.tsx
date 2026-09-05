"use client";

import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", petType: "" });

  const load = () => fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", slug: "", petType: "" });
    load();
  };

  const toggle = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this category? Products in it will need reassigning.")) return;
    await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Categories</h1>

      <div className="mt-4 flex gap-2 rounded-xl bg-white p-4 shadow-sm">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <input placeholder="Pet type (dog/cat/blank)" value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
        <button onClick={create} className="rounded-lg bg-sage-500 px-3 py-1 text-sm text-white">Add</button>
      </div>

      <ul className="mt-4 divide-y divide-[#f0f2f4] rounded-xl bg-white shadow-sm">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3 text-sm">
            <span>{c.name} <span className="text-[#9ca3af]">/{c.slug}</span></span>
            <div className="flex gap-3">
              <button onClick={() => toggle(c.id, c.isActive)} className="text-sage-600">{c.isActive ? "Disable" : "Enable"}</button>
              <button onClick={() => remove(c.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
