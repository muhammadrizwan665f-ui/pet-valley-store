"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/account/me").then((r) => r.json()).then((u) => setForm({ firstName: u.firstName || "", lastName: u.lastName || "", phone: u.phone || "" }));
  }, [session]);

  const save = async () => {
    await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-3xl text-charcoal">Edit Profile</h1>
      <div className="mt-6 space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
        <Button variant="primary" onClick={save}>{saved ? "Saved ✓" : "Save Changes"}</Button>
      </div>
    </main>
  );
}
