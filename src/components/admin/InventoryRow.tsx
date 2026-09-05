"use client";

import { useState } from "react";

export function InventoryRow({ product }: { product: { id: string; name: string; sku: string; stock: number; lowStockAt: number } }) {
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);

  const status = stock === 0 ? "Out of stock" : stock <= product.lowStockAt ? "Low stock" : "In stock";
  const statusColor = stock === 0 ? "text-red-600" : stock <= product.lowStockAt ? "text-amber-600" : "text-sage-600";

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, stock }),
    });
    setSaving(false);
  };

  return (
    <tr className="border-t border-[#f0f2f4]">
      <td className="p-3 font-medium">{product.name}</td>
      <td className="p-3">{product.sku}</td>
      <td className="p-3">
        <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} className="w-20 rounded-lg border border-[#e4e6e8] px-2 py-1" />
      </td>
      <td className={`p-3 ${statusColor}`}>{status}</td>
      <td className="p-3">
        <button onClick={save} disabled={saving} className="rounded-lg bg-sage-500 px-3 py-1 text-xs text-white">
          {saving ? "Saving…" : "Update"}
        </button>
      </td>
    </tr>
  );
}
