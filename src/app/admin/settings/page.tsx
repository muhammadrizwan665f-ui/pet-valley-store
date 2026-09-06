"use client";

import { useEffect, useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";

const THEMES = [
  { id: "sage", label: "Sage (default)", swatch: "#6f8a5c" },
  { id: "ocean", label: "Ocean", swatch: "#3d6f76" },
  { id: "blush", label: "Blush", swatch: "#a25353" },
  { id: "amber", label: "Amber", swatch: "#a06b34" },
  { id: "slate", label: "Slate", swatch: "#5c6d7e" },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then(setForm); }, []);

  const save = async (overrides?: any) => {
    setSaving(true);
    const payload = overrides ? { ...form, ...overrides } : form;
    if (overrides) setForm(payload);
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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

      {/* Theme picker */}
      <div className="rounded-2xl border border-[#e4e6e8] p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Store Theme</h2>
          <p className="mt-1 text-xs text-[#6b7280]">Pick a colour theme for the whole site. Changes apply immediately after saving.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => void save({ theme: t.id })}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 text-xs ${
                form.theme === t.id ? "border-sage-500" : "border-transparent"
              }`}
            >
              <span className="h-10 w-10 rounded-full" style={{ backgroundColor: t.swatch }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Homepage banner */}
      <div className="rounded-2xl border border-[#e4e6e8] p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Homepage Banner</h2>
          <p className="mt-1 text-xs text-[#6b7280]">Controls the large image + headline shown at the top of your homepage.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Desktop Banner Image</label>
          <p className="mb-1.5 text-xs text-[#6b7280]">Wide photo — looks best around 1600×900px (16:9).</p>
          <MediaUploader
            accept="image/*"
            value={form.heroImageUrl ? { url: form.heroImageUrl, type: "image" } : undefined}
            onChange={(media) => setForm({ ...form, heroImageUrl: media.url })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mobile Banner Image (optional)</label>
          <p className="mb-1.5 text-xs text-[#6b7280]">
            A taller crop of the same photo for phones — around 900×1200px (3:4). If left empty, the desktop image is
            reused and may look cropped oddly on small screens.
          </p>
          <MediaUploader
            accept="image/*"
            value={form.heroImageMobileUrl ? { url: form.heroImageMobileUrl, type: "image" } : undefined}
            onChange={(media) => setForm({ ...form, heroImageMobileUrl: media.url })}
          />
        </div>
        {field("Banner Title", "heroTitle")}
        {field("Banner Subtitle", "heroSubtitle")}
        <div className="flex gap-2">
          <div className="w-1/2">{field("Button Text", "heroCtaText")}</div>
          <div className="w-1/2">{field("Button Link", "heroCtaLink")}</div>
        </div>
      </div>

      {/* Manual payment */}
      <div className="rounded-2xl border border-[#e4e6e8] p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Manual Bank Transfer Payment</h2>
          <p className="mt-1 text-xs text-[#6b7280]">
            Let customers pay by bank transfer and upload a payment screenshot, alongside PayFast.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.manualPaymentEnabled}
            onChange={(e) => setForm({ ...form, manualPaymentEnabled: e.target.checked })}
          />
          Enable manual bank transfer at checkout
        </label>
        {field("Bank Name", "bankName")}
        {field("Account Title", "bankAccountTitle")}
        <div className="flex gap-2">
          <div className="w-1/2">{field("Account Number", "bankAccountNumber")}</div>
          <div className="w-1/2">{field("IBAN (optional)", "bankIban")}</div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Instructions shown to customer</label>
          <textarea
            value={form.manualPaymentInstructions ?? ""}
            onChange={(e) => setForm({ ...form, manualPaymentInstructions: e.target.value })}
            className="w-full rounded-lg border border-[#e4e6e8] px-3 py-2 text-sm"
            rows={3}
          />
        </div>
      </div>

      <button onClick={() => void save()} disabled={saving} className="rounded-lg bg-sage-500 px-4 py-2 text-sm text-white">
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
