"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then((o) => {
      setOrder(o);
      setNotes(o.internalNotes || "");
    });
  }, [id]);

  const updateStatus = async (status: string) => {
    if (status === "CANCELLED" || status === "REFUNDED") {
      const confirmed = window.confirm(`Are you sure you want to mark this order as ${status}? This cannot be easily undone.`);
      if (!confirmed) return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrder(await res.json());
    setSaving(false);
  };

  const updatePaymentStatus = async (paymentStatus: string) => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus,
        ...(paymentStatus === "PAID" ? { status: "PAID" } : {}),
        note: paymentStatus === "PAID" ? "Manual payment proof verified by admin" : "Manual payment proof rejected by admin",
      }),
    });
    setOrder(await res.json());
    setSaving(false);
  };

  const saveTracking = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCarrier: carrier, trackingNumber: tracking, internalNotes: notes }),
    });
    setOrder(await res.json());
    setSaving(false);
  };

  if (!order) return <p className="text-sm text-[#6b7280]">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Order {order.orderNumber}</h1>

      {order.paymentProofUrl && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium">Payment Proof (Manual Bank Transfer)</p>
          <img src={order.paymentProofUrl} alt="Payment proof" className="max-h-96 rounded-lg border border-[#e4e6e8]" />
          <p className="mt-2 text-xs text-[#6b7280]">Current payment status: <span className="font-medium">{order.paymentStatus}</span></p>
          {order.paymentStatus !== "PAID" && (
            <div className="mt-3 flex gap-2">
              <button onClick={() => updatePaymentStatus("PAID")} disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm text-white">
                Approve & Mark Paid
              </button>
              <button onClick={() => updatePaymentStatus("FAILED")} disabled={saving} className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white">
                Reject Proof
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium">Status</p>
        <select value={order.status} onChange={(e) => updateStatus(e.target.value)} disabled={saving} className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium">Tracking</p>
        <div className="flex gap-2">
          <input placeholder="Carrier" defaultValue={order.shipment?.carrier} onChange={(e) => setCarrier(e.target.value)} className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm" />
          <input placeholder="Tracking number" defaultValue={order.shipment?.trackingNumber} onChange={(e) => setTracking(e.target.value)} className="rounded-lg border border-[#e4e6e8] px-3 py-1.5 text-sm" />
        </div>
        <p className="mb-2 mt-4 text-sm font-medium">Internal notes</p>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" rows={3} />
        <button onClick={saveTracking} disabled={saving} className="mt-3 rounded-lg bg-sage-500 px-4 py-1.5 text-sm text-white">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
