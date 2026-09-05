"use client";

import { useState } from "react";

export function ReviewRow({ review }: { review: { id: string; rating: number; title?: string | null; body?: string | null; status: string; product: string; user: string } }) {
  const [status, setStatus] = useState(review.status);
  const [hidden, setHidden] = useState(false);

  const setState = async (next: string) => {
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: review.id, status: next }) });
    setStatus(next);
  };

  const remove = async () => {
    if (!window.confirm("Delete this review permanently?")) return;
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: review.id }) });
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <li className="p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{review.product} — {"★".repeat(review.rating)}</span>
        <span className="text-xs text-[#9ca3af]">{status}</span>
      </div>
      <p className="text-[#4b5563]">{review.title} {review.body}</p>
      <p className="text-xs text-[#9ca3af]">by {review.user}</p>
      <div className="mt-1 flex gap-3">
        <button onClick={() => setState("APPROVED")} className="text-sage-600">Approve</button>
        <button onClick={() => setState("REJECTED")} className="text-amber-600">Reject</button>
        <button onClick={remove} className="text-red-600">Delete</button>
      </div>
    </li>
  );
}
