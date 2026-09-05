"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    const sessionRes = await fetch("/api/account/me");
    const user = sessionRes.ok ? await sessionRes.json() : null;
    router.push(user?.role === "ADMIN" || user?.role === "STAFF" ? "/admin" : "/account");
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl text-charcoal">Welcome back</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-sage-200 px-3 py-2" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-sage-200 px-3 py-2" />
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
        <p className="text-center text-sm text-charcoal-light">
          No account? <a href="/register" className="text-sage-600 underline">Register</a>
        </p>
        <p className="text-center text-xs text-charcoal-light">
          <a href="/forgot-password" className="underline">Forgot your password?</a>
        </p>
      </motion.form>
    </main>
  );
}
