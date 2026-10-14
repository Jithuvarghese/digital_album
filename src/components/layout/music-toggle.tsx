"use client";

import { motion } from "framer-motion";
import { useMusic } from "@/lib/music";
import { useDevice } from "@/state/device";

/** Floating music button, shown once the invitation has been opened. */
export function MusicToggle() {
  const { on, toggle } = useMusic();
  const introSeen = useDevice((s) => s.introSeen);
  if (!introSeen) return null;
  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Pause music" : "Play music"}
      className="no-print fixed bottom-[84px] right-3 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper/90 text-maroon shadow-card ring-1 ring-gold/40 backdrop-blur transition hover:bg-paper lg:bottom-5 lg:right-5"
    >
      {on ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <motion.span key={i} className="w-[3px] rounded-full bg-maroon" animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }} transition={{ repeat: Infinity, duration: 1.1 + i * 0.15, ease: "easeInOut" }} />
          ))}
        </span>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
        </svg>
      )}
    </button>
  );
}
