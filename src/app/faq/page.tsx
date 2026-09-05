"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How long does shipping take?", a: "Most international orders arrive within 7–14 business days depending on destination country and customs processing." },
  { q: "What is your return policy?", a: "Unopened, unused items can be returned within 30 days of delivery. See our Return Policy page for full details." },
  { q: "Which payment methods do you accept?", a: "We process payments securely through PayFast, supporting major cards and regional payment methods." },
  { q: "Do you ship internationally?", a: "Yes — we ship to the USA, UK, Canada, Australia, and other international destinations." },
  { q: "How can I track my order?", a: "Once your order ships, tracking details appear on your My Orders page and in your shipping confirmation." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl text-charcoal">Frequently Asked Questions</h1>
      <div className="mt-8 divide-y divide-sage-100">
        {FAQS.map((item, i) => (
          <div key={i} className="py-4">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between text-left">
              <span className="font-medium text-charcoal">{item.q}</span>
              <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden text-sm text-charcoal-light"
                >
                  <span className="block pt-2">{item.a}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </main>
  );
}
