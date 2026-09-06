"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then(setForm); }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
  };

  if (!form) return <p className="text-sm text-[#6b7280]">Loading…</p>;

  const field = (label: string, key: string, type = "text") => (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input type={type} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm" />
    </div>
  );

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      {field("Store Name", "storeName")}
      {field("Store Email", "storeEmail", "email")}
      {field("Support Email", "supportEmail", "email")}
      {field("Currency", "currency")}
      {field("Tax Rate (%)", "taxRatePercent", "number")}
      {field("Free Shipping Over ($)", "freeShippingOver", "number")}
      {field("Flat Shipping Rate ($)", "flatShippingRate", "number")}
      {field("Announcement Bar Text", "announcementText")}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.storeIsLive} onChange={(e) => setForm({ ...form, storeIsLive: e.target.checked })} /> Store is live
      </label>

      <div className="rounded-2xl border border-[#e4e6e8] p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Homepage Banner</h2>
          <p className="mt-1 text-xs text-[#6b7280]">Controls the large image + headline shown at the top of your homepage.</p>
        </div>
        {form.heroImageUrl && (
          <img src={form.heroImageUrl} alt="" className="h-32 w-full rounded-xl object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.3")} />
        )}
        {field("Banner Image URL", "heroImageUrl")}
        {field("Banner Title", "heroTitle")}
        {field("Banner Subtitle", "heroSubtitle")}
        <div className="flex gap-2">
          <div className="w-1/2">{field("Button Text", "heroCtaText")}</div>
          <div className="w-1/2">{field("Button Link", "heroCtaLink")}</div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="rounded-lg bg-sage-500 px-4 py-2 text-sm text-white">
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
