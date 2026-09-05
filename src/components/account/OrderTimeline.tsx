"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

const LABELS: Record<(typeof STEPS)[number], string> = {
  PENDING: "Order Placed",
  PAID: "Payment Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STEPS.indexOf(currentStatus as any);
  const isTerminalIssue = currentStatus === "CANCELLED" || currentStatus === "REFUNDED";

  if (isTerminalIssue) {
    return <p className="text-sm font-medium text-red-600">Order {currentStatus.toLowerCase()}</p>;
  }

  return (
    <ol className="space-y-4">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step} className="flex items-center gap-3">
            <motion.div
              initial={false}
              animate={{ backgroundColor: done ? "#6f8a5c" : "#e6ebe1", scale: done ? 1 : 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex h-6 w-6 items-center justify-center rounded-full"
            >
              {done && <Check size={14} className="text-white" />}
            </motion.div>
            <span className={done ? "text-sm font-medium text-charcoal" : "text-sm text-charcoal-light"}>
              {LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
