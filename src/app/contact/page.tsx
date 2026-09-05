"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "sent" : "error");
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl text-charcoal">Contact Us</h1>
      <p className="mt-2 text-sm text-charcoal-light">Questions about an order, a product, or anything else — we're happy to help.</p>

      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.p key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-sage-600">
            Thanks — we've received your message and will get back to you soon.
          </motion.p>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} className="mt-8 space-y-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
            <textarea required placeholder="Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
            <Button variant="primary" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send Message"}
            </Button>
            {status === "error" && <p className="text-sm text-red-600">Something went wrong — please try again.</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  );
}
