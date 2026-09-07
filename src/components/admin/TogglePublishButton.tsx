"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TogglePublishButton({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  };

  return (
    <button onClick={handleToggle} disabled={saving} className="text-charcoal-light disabled:opacity-50">
      {saving ? "…" : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
