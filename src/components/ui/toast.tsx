"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUi } from "@/state/ui";

export function Toast() {
  const toast = useUi((s) => s.toast);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-full bg-ink px-5 py-3 text-sm text-jasmine shadow-card"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
