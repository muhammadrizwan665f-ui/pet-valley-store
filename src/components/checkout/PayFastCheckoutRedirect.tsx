"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Checkout "Place Order" step. Calls our own API to create the order,
 * then auto-submits a hidden POST form straight to PayFast — PayFast
 * requires the browser to land on payfast.co.za itself, not a fetch/XHR.
 */
export default function PayFastCheckoutRedirect({
  shippingAddressId,
  billingAddressId,
}: {
  shippingAddressId: string;
  billingAddressId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);
  const [processUrl, setProcessUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const couponCode = typeof window !== "undefined" ? sessionStorage.getItem("pv_coupon") : null;
        const res = await fetch("/api/checkout/payfast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shippingAddressId, billingAddressId, couponCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start checkout");
        sessionStorage.removeItem("pv_coupon");
        setFields(data.fields);
        setProcessUrl(data.processUrl);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [shippingAddressId, billingAddressId]);

  useEffect(() => {
    if (fields && formRef.current) formRef.current.submit();
  }, [fields]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-8 w-8 rounded-full border-2 border-sage-200 border-t-sage-500 motion-reduce:animate-none"
      />
      <p className="text-sm text-charcoal-light">Redirecting you to PayFast to complete payment…</p>

      {fields && processUrl && (
        <form ref={formRef} action={processUrl} method="POST" className="hidden">
          {Object.entries(fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </div>
  );
}
