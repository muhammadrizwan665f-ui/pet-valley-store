"use client";

import { useEffect, useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", petType: "", imageUrl: "" });

  const load = () => fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", slug: "", petType: "", imageUrl: "" });
    load();
  };

  const patch = async (id: string, data: any) => {
    await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = categories[index + dir];
    if (!target) return;
    const current = categories[index];
    await Promise.all([
      fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: current.id, sortOrder: target.sortOrder }) }),
      fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: target.id, sortOrder: current.sortOrder }) }),
    ]);
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
      <p className="mt-1 text-xs text-[#6b7280]">
        These show as image tiles in "Shop by Category" on your homepage — add a photo for each one you want to appear there.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
        <MediaUploader
          accept="image/*"
          value={form.imageUrl ? { url: form.imageUrl, type: "image" } : undefined}
          onChange={(media) => setForm({ ...form, imageUrl: media.url })}
        />
        <div className="flex flex-wrap gap-2">
          <input placeholder="Name (e.g. Dog Food)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
          <input placeholder="Slug (e.g. dog-food)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm" />
          <select value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value })} className="rounded-lg border border-[#e4e6e8] px-2 py-1 text-sm">
            <option value="">Any pet</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
          <button onClick={create} className="rounded-lg bg-sage-500 px-3 py-1 text-sm text-white">Add</button>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-[#f0f2f4] rounded-xl bg-white shadow-sm">
        {categories.map((c, i) => (
          <li key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <div className="flex items-center gap-3">
              <MediaUploader
                accept="image/*"
                value={c.imageUrl ? { url: c.imageUrl, type: "image" } : undefined}
                onChange={(media) => patch(c.id, { imageUrl: media.url })}
              />
              <div>
                <input
                  defaultValue={c.name}
                  onBlur={(e) => e.target.value !== c.name && patch(c.id, { name: e.target.value })}
                  className="w-40 rounded border border-transparent bg-transparent px-1 py-0.5 font-medium hover:border-[#e4e6e8] focus:border-[#e4e6e8] focus:outline-none"
                />
                <p className="px-1 text-xs text-[#9ca3af]">/{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-[#9ca3af] disabled:opacity-30"><ArrowUp size={14} /></button>
              <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="text-[#9ca3af] disabled:opacity-30"><ArrowDown size={14} /></button>
              <button onClick={() => patch(c.id, { isActive: !c.isActive })} className="text-sage-600">{c.isActive ? "Disable" : "Enable"}</button>
              <button onClick={() => remove(c.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
