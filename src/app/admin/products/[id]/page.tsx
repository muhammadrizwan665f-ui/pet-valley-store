"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MediaUploader } from "@/components/admin/MediaUploader";

type ImageRow = { id?: string; url: string; type: "image" | "video"; altText?: string };
type VariantRow = { id?: string; name: string; value: string; imageUrl?: string; priceDelta?: number; sku?: string; stock?: number };

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    name: "", slug: "", categoryId: "", petType: "dog", description: "",
    price: "", compareAtPrice: "", sku: "", stock: "0", isPublished: false,
  });
  const [images, setImages] = useState<ImageRow[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
    if (!isNew) {
      fetch(`/api/admin/products/${params.id}`).then((r) => r.json()).then((p) => {
        setForm({
          name: p.name, slug: p.slug, categoryId: p.categoryId, petType: p.petType,
          description: p.description, price: p.price, compareAtPrice: p.compareAtPrice || "",
          sku: p.sku, stock: String(p.stock), isPublished: p.isPublished,
        });
        setImages((p.images || []).map((i: any) => ({ id: i.id, url: i.url, type: i.type || "image", altText: i.altText || "" })));
        setVariants((p.variants || []).map((v: any) => ({
          id: v.id, name: v.name, value: v.value, imageUrl: v.imageUrl || "",
          priceDelta: v.priceDelta, sku: v.sku || "", stock: v.stock,
        })));
      });
    }
  }, [isNew, params.id]);

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
      stock: parseInt(form.stock, 10),
      images: images.filter((i) => i.url.trim()),
      variants: variants.filter((v) => v.value.trim()).map((v) => ({
        ...v,
        priceDelta: Number(v.priceDelta) || 0,
        stock: Number(v.stock) || 0,
      })),
    };
    const res = isNew
      ? await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: params.id, ...payload }) });
    setSaving(false);
    if (res.ok) router.push("/admin/products");
  };

  const inputCls = "w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm";

  return (
    <div className="max-w-2xl space-y-8 pb-16">
      <h1 className="text-xl font-semibold">{isNew ? "New Product" : "Edit Product"}</h1>

      {/* Basic info */}
      <div className="space-y-4">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        <input placeholder="Slug (url-friendly)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value })} className={inputCls}>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="both">Both</option>
        </select>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} rows={4} />
        <div className="flex gap-2">
          <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={`w-1/2 ${inputCls}`} />
          <input placeholder="Compare-at price" type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className={`w-1/2 ${inputCls}`} />
        </div>
        <div className="flex gap-2">
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={`w-1/2 ${inputCls}`} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={`w-1/2 ${inputCls}`} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published
        </label>
      </div>

      {/* Product images & videos */}
      <div className="rounded-2xl border border-[#e4e6e8] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Product Photos & Videos</h2>
          <button
            type="button"
            onClick={() => setImages([...images, { url: "", type: "image", altText: "" }])}
            className="rounded-lg bg-sage-100 px-3 py-1.5 text-xs font-medium text-sage-700"
          >
            + Add Slot
          </button>
        </div>
        <p className="mb-3 text-xs text-[#6b7280]">Upload photos or a short product video straight from your device.</p>
        <div className="flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <MediaUploader
                value={img.url ? { url: img.url, type: img.type } : undefined}
                onChange={(media) => setImages(images.map((x, j) => (j === i ? { ...x, url: media.url, type: media.type } : x)))}
              />
              <input
                placeholder="Alt text"
                value={img.altText}
                onChange={(e) => setImages(images.map((x, j) => (j === i ? { ...x, altText: e.target.value } : x)))}
                className="w-28 rounded-lg border border-[#e4e6e8] px-2 py-1 text-[11px]"
              />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-[10px] font-medium text-red-500">
                Remove
              </button>
            </div>
          ))}
          {images.length === 0 && <p className="text-xs text-[#9ca3af]">No photos/videos yet.</p>}
        </div>
      </div>

      {/* Colour / variant options */}
      <div className="rounded-2xl border border-[#e4e6e8] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Colours / Options</h2>
          <button
            type="button"
            onClick={() => setVariants([...variants, { name: "Color", value: "", imageUrl: "", priceDelta: 0, sku: "", stock: 0 }])}
            className="rounded-lg bg-sage-100 px-3 py-1.5 text-xs font-medium text-sage-700"
          >
            + Add Colour
          </button>
        </div>
        <p className="mb-3 text-xs text-[#6b7280]">
          Each colour can have its own uploaded photo, price adjustment, SKU and stock count. Customers pick one on the product page.
        </p>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="space-y-2 rounded-xl bg-[#f7f8f9] p-3">
              <div className="flex items-start gap-3">
                <MediaUploader
                  accept="image/*"
                  value={v.imageUrl ? { url: v.imageUrl, type: "image" } : undefined}
                  onChange={(media) => setVariants(variants.map((x, j) => (j === i ? { ...x, imageUrl: media.url } : x)))}
                  className="shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      placeholder="Attribute (e.g. Color)"
                      value={v.name}
                      onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      className={`w-1/2 ${inputCls}`}
                    />
                    <input
                      placeholder="Value (e.g. Red)"
                      value={v.value}
                      onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                      className={`w-1/2 ${inputCls}`}
                    />
                  </div>
                </div>
                <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="mt-1 text-xs font-medium text-red-500">
                  Remove
                </button>
              </div>
              <div className="flex gap-2 pl-[124px]">
                <input
                  placeholder="Price adjustment (+/-)"
                  type="number"
                  value={v.priceDelta}
                  onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, priceDelta: Number(e.target.value) } : x)))}
                  className={`w-1/3 ${inputCls}`}
                />
                <input
                  placeholder="SKU"
                  value={v.sku}
                  onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))}
                  className={`w-1/3 ${inputCls}`}
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={v.stock}
                  onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))}
                  className={`w-1/3 ${inputCls}`}
                />
              </div>
            </div>
          ))}
          {variants.length === 0 && <p className="text-xs text-[#9ca3af]">No colours/options yet — product will just use the single price and photos above.</p>}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="rounded-lg bg-sage-500 px-4 py-2 text-sm text-white">
        {saving ? "Saving…" : "Save Product"}
      </button>
    </div>
  );
}
