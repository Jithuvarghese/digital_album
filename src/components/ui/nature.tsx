"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/lib/music";

/**
 * Small flocks of birds glide across the page every so often, with soft chirps when the
 * guest has music switched on. A butterfly drifts by now and then. Purely decorative.
 */

type Flock = { id: number; top: number; dir: 1 | -1; birds: Array<{ dx: number; dy: number; scale: number; flap: number }>; duration: number };
type Fly = { id: number; bottom: number; dir: 1 | -1 };

let audio: AudioContext | null = null;

/** A short, bright two-note bird call made in the browser. */
function chirp() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    audio ??= new AC();
    const ctx = audio;
    const calls = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < calls; i++) {
      const at = ctx.currentTime + i * (0.11 + Math.random() * 0.06);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      const base = 2600 + Math.random() * 900;
      o.frequency.setValueAtTime(base, at);
      o.frequency.exponentialRampToValueAtTime(base * 1.45, at + 0.05);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, at + 0.09);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.025, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, at + 0.1);
      o.connect(g).connect(ctx.destination);
      o.start(at);
      o.stop(at + 0.12);
    }
  } catch {
    /* sound is optional */
  }
}

function Bird({ flap, color }: { flap: number; color: string }) {
  return (
    <svg viewBox="0 0 40 20" width="34" height="17" aria-hidden className="overflow-visible">
      <motion.path
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: ["M2 10 Q11 1 20 10 Q29 1 38 10", "M2 9 Q11 15 20 10 Q29 15 38 9", "M2 10 Q11 1 20 10 Q29 1 38 10"] }}
        transition={{ duration: flap, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="20" cy="10.5" r="1.6" fill={color} />
    </svg>
  );
}

function Butterfly() {
  return (
    <svg viewBox="0 0 40 32" width="30" height="24" aria-hidden>
      <motion.g style={{ originX: "20px", originY: "16px" }} animate={{ scaleX: [1, 0.25, 1] }} transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M20 16 C10 2 0 6 4 15 C6 20 14 19 20 16Z" fill="rgb(var(--c-accent))" opacity="0.85" />
        <path d="M20 16 C30 2 40 6 36 15 C34 20 26 19 20 16Z" fill="rgb(var(--c-accent))" opacity="0.85" />
        <path d="M20 17 C13 22 8 29 13 30 C17 31 19 24 20 17Z" fill="rgb(var(--c-bride))" opacity="0.75" />
        <path d="M20 17 C27 22 32 29 27 30 C23 31 21 24 20 17Z" fill="rgb(var(--c-bride))" opacity="0.75" />
      </motion.g>
      <path d="M20 9 L20 25" stroke="rgb(var(--c-ink))" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Nature() {
  const reduce = useReducedMotion();
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [flies, setFlies] = useState<Fly[]>([]);
  const next = useRef(0);

  useEffect(() => {
    if (reduce) return;
    let birdTimer: ReturnType<typeof setTimeout>;
    let flyTimer: ReturnType<typeof setTimeout>;

    const launchFlock = () => {
      const id = ++next.current;
      const size = 2 + Math.floor(Math.random() * 3);
      const flock: Flock = {
        id,
        top: 8 + Math.random() * 30,
        dir: Math.random() < 0.5 ? 1 : -1,
        duration: 16 + Math.random() * 8,
        birds: Array.from({ length: size }, (_, i) => ({
          dx: i * (26 + Math.random() * 18),
          dy: (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (10 + Math.random() * 8),
          scale: 0.6 + Math.random() * 0.45,
          flap: 0.45 + Math.random() * 0.25,
        })),
      };
      setFlocks((f) => [...f, flock]);
      if (useMusic.getState().on && document.visibilityState === "visible") {
        setTimeout(chirp, 1500);
        setTimeout(chirp, 4500 + Math.random() * 3000);
      }
      setTimeout(() => setFlocks((f) => f.filter((x) => x.id !== id)), flock.duration * 1000 + 500);
      birdTimer = setTimeout(launchFlock, 18_000 + Math.random() * 16_000);
    };

    const launchFly = () => {
      const id = ++next.current;
      setFlies((f) => [...f, { id, bottom: 12 + Math.random() * 30, dir: Math.random() < 0.5 ? 1 : -1 }]);
      setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 22_500);
      flyTimer = setTimeout(launchFly, 45_000 + Math.random() * 40_000);
    };

    birdTimer = setTimeout(launchFlock, 4000);
    flyTimer = setTimeout(launchFly, 20_000);
    return () => {
      clearTimeout(birdTimer);
      clearTimeout(flyTimer);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {flocks.map((f) => (
          <motion.div
            key={f.id}
            className="absolute"
            style={{ top: `${f.top}%`, left: 0 }}
            initial={{ x: f.dir === 1 ? "-20vw" : "110vw", opacity: 0 }}
            animate={{ x: f.dir === 1 ? "110vw" : "-20vw", opacity: [0, 0.75, 0.75, 0], y: [0, -18, 6, -10, 0] }}
            transition={{ duration: f.duration, ease: "linear", opacity: { duration: f.duration, times: [0, 0.08, 0.9, 1] }, y: { duration: f.duration, ease: "easeInOut" } }}
          >
            <div style={{ transform: f.dir === -1 ? "scaleX(-1)" : undefined }}>
              {f.birds.map((b, i) => (
                <div key={i} className="absolute" style={{ transform: `translate(${-b.dx}px, ${b.dy}px) scale(${b.scale})` }}>
                  <Bird flap={b.flap} color="rgb(var(--c-ink) / 0.55)" />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        {flies.map((f) => (
          <motion.div
            key={f.id}
            className="absolute"
            style={{ bottom: `${f.bottom}%`, left: 0 }}
            initial={{ x: f.dir === 1 ? "-10vw" : "105vw", opacity: 0 }}
            animate={{ x: f.dir === 1 ? "105vw" : "-10vw", y: [0, -40, 10, -30, 20, -10, 0], rotate: [0, -8, 6, -5, 8, 0], opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 22, ease: "linear", opacity: { duration: 22, times: [0, 0.06, 0.92, 1] } }}
          >
            <Butterfly />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
