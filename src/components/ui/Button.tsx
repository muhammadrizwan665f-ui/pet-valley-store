"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-sage-500 text-white hover:bg-sage-600",
  secondary: "bg-cream border border-sage-300 text-charcoal hover:bg-sage-50",
  ghost: "bg-transparent text-charcoal hover:bg-sage-50",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium tracking-wide",
        "transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-500",
        "motion-reduce:transform-none",
        variantClasses[variant],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
