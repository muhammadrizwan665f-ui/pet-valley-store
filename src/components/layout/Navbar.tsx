"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/cartStore";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/dogs", label: "Dogs" },
  { href: "/cats", label: "Cats" },
  { href: "/shop?sort=featured", label: "Best Sellers" },
  { href: "/about", label: "About Us" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const openCart = useCartStore((s) => s.openCart);

  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl tracking-wide text-charcoal">PET VALLEY</Link>

        <nav className="hidden gap-6 text-sm text-charcoal md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-sage-600">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Search"><Search size={18} /></button>
          <Link href={session ? "/account" : "/login"} aria-label="Account"><User size={18} /></Link>
          <Link href="/wishlist" aria-label="Wishlist"><Heart size={18} /></Link>
          <button onClick={openCart} aria-label="Open cart"><ShoppingBag size={18} /></button>
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-72 bg-white p-6 shadow-xl md:hidden"
          >
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="mb-6"><X size={20} /></button>
            <nav className="flex flex-col gap-4 text-base">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
