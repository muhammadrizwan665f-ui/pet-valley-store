"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(false);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error || "Could not delete this product. Please try again.");
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleting} className="text-red-600 disabled:opacity-50">
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
