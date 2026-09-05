"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden bg-sage-500 text-center text-xs text-white"
        >
          <div className="relative flex items-center justify-center py-2">
            <span>{text}</span>
            <button onClick={() => setVisible(false)} aria-label="Dismiss" className="absolute right-4">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
