"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    name: "", slug: "", categoryId: "", petType: "dog", description: "",
    price: "", compareAtPrice: "", sku: "", stock: "0", isPublished: false,
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
    if (!isNew) {
      fetch(`/api/admin/products/${params.id}`).then((r) => r.json()).then((p) =>
        setForm({
          name: p.name, slug: p.slug, categoryId: p.categoryId, petType: p.petType,
          description: p.description, price: p.price, compareAtPrice: p.compareAtPrice || "",
          sku: p.sku, stock: String(p.stock), isPublished: p.isPublished,
        })
      );
    }
  }, [isNew, params.id]);

  const save = async () => {
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null, stock: parseInt(form.stock, 10) };
    const res = isNew
      ? await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: params.id, ...payload }) });
    setSaving(false);
    if (res.ok) router.push("/admin/products");
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">{isNew ? "New Product" : "Edit Product"}</h1>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
      <input placeholder="Slug (url-friendly)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm">
        <option value="">Select category</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm">
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="both">Both</option>
      </select>
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" rows={4} />
      <div className="flex gap-2">
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-1/2 rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
        <input placeholder="Compare-at price" type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="w-1/2 rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-2">
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-1/2 rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
        <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-1/2 rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published
      </label>
      <button onClick={save} disabled={saving} className="rounded-lg bg-sage-500 px-4 py-2 text-sm text-white">
        {saving ? "Saving…" : "Save Product"}
      </button>
    </div>
  );
}
