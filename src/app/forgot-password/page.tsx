"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setLoading(false);
    setSent(true);
  };

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl text-charcoal">Reset your password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-charcoal-light">If an account exists for that email, a reset link has been sent.</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm" />
            <Button variant="primary" type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</Button>
          </form>
        )}
      </div>
    </main>
  );
}
