"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AddReviewForm() {
  const router = useRouter();
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ productId: "", authorName: "", rating: "5", title: "", body: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products/list-lite")
      .then((r) => (r.ok ? r.json() : []))
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const submit = async () => {
    if (!form.productId || !form.authorName) return;
    setSaving(true);
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rating: Number(form.rating) }),
    });
    setSaving(false);
    setForm({ productId: form.productId, authorName: "", rating: "5", title: "", body: "" });
    router.refresh();
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium">Add a Review</p>
      <div className="flex flex-wrap gap-2">
        <select
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="rounded-lg border border-[#e4e6e8] px-2 py-1.5 text-sm"
        >
          <option value="">Select product…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input
          placeholder="Reviewer name"
          value={form.authorName}
          onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          className="rounded-lg border border-[#e4e6e8] px-2 py-1.5 text-sm"
        />
        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="rounded-lg border border-[#e4e6e8] px-2 py-1.5 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
        </select>
      </div>
      <input
        placeholder="Review title (optional)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="mt-2 w-full rounded-lg border border-[#e4e6e8] px-2 py-1.5 text-sm"
      />
      <textarea
        placeholder="Review text (optional)"
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
        className="mt-2 w-full rounded-lg border border-[#e4e6e8] px-2 py-1.5 text-sm"
        rows={2}
      />
      <button onClick={submit} disabled={saving || !form.productId || !form.authorName} className="mt-3 rounded-lg bg-sage-500 px-4 py-1.5 text-sm text-white disabled:opacity-50">
        {saving ? "Adding…" : "Add Review"}
      </button>
    </div>
  );
}
