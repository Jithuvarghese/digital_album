"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Item = { id: number; x: number; y: number; emoji: string; speed: number };
let nextId = 0;

const ITEMS = ["🍫", "🍫", "🍬", "🍬", "💖", "🧁", "🍫", "💐"];

export function CatchGame({ onPoints }: { onPoints: (n: number) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [basket, setBasket] = useState(50); // % from left
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const awardedRef = useRef(false);

  const tick = useCallback((ts: number) => {
    const dt = Math.min((ts - lastRef.current) / 1000, 0.1);
    lastRef.current = ts;
    spawnRef.current += dt;

    setItems((prev) => {
      let next = prev
        .map((it) => ({ ...it, y: it.y + it.speed * dt * 100 }))
        .filter((it) => it.y < 110);

      // Check catches
      let newCaught = 0;
      let newMissed = 0;
      next = next.filter((it) => {
        if (it.y >= 82 && it.y <= 98) {
          const bLeft = basket - 9;
          const bRight = basket + 9;
          if (it.x >= bLeft && it.x <= bRight) {
            newCaught++;
            return false;
          }
        }
        if (it.y >= 100) {
          if (it.emoji === "💖") newMissed++;
          return false;
        }
        return true;
      });

      if (newCaught > 0) setCaught((c) => c + newCaught);
      if (newMissed > 0) setMissed((m) => m + newMissed);

      if (spawnRef.current > 0.9) {
        spawnRef.current = 0;
        next.push({
          id: ++nextId,
          x: 8 + Math.random() * 84,
          y: -8,
          emoji: ITEMS[Math.floor(Math.random() * ITEMS.length)],
          speed: 18 + Math.random() * 14,
        });
      }
      return next;
    });

    frameRef.current = requestAnimationFrame(tick);
  }, [basket]);

  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    frameRef.current = requestAnimationFrame(tick);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      cancelAnimationFrame(frameRef.current!);
      clearInterval(timer);
    };
  }, [running, tick]);

  useEffect(() => {
    if (finished && !awardedRef.current) {
      awardedRef.current = true;
      onPoints(caught * 2);
    }
  }, [finished, caught, onPoints]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setBasket(Math.min(91, Math.max(9, ((e.clientX - rect.left) / rect.width) * 100)));
  };

  const onTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    setBasket(Math.min(91, Math.max(9, ((touch.clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-sm items-center justify-between rounded-2xl bg-maroon/5 px-4 py-2 text-sm font-semibold text-maroon">
        <span>⏱ {timeLeft}s</span>
        <span>Caught: {caught}</span>
        <span>Missed: {missed}</span>
      </div>

      {!running && !finished && (
        <div className="card mx-auto max-w-sm p-6 text-center">
          <p className="text-2xl">🍫</p>
          <h3 className="mt-2 font-serif text-2xl text-maroon">Catch the Treats!</h3>
          <p className="mt-2 text-sm text-muted">Move the basket to catch falling chocolates and hearts. Don't miss the 💖!</p>
          <button className="btn-primary mt-4 w-full" onClick={() => { setRunning(true); setCaught(0); setMissed(0); setTimeLeft(30); setItems([]); awardedRef.current = false; }}>
            Start Game
          </button>
        </div>
      )}

      {finished && (
        <div className="card mx-auto max-w-sm p-6 text-center">
          <p className="text-3xl">🎉</p>
          <h3 className="mt-2 font-serif text-2xl text-maroon">Well done!</h3>
          <p className="mt-1 text-muted">You caught {caught} treats! +{caught * 2} points</p>
          <button className="btn-primary mt-4 w-full" onClick={() => { setFinished(false); setRunning(true); setCaught(0); setMissed(0); setTimeLeft(30); setItems([]); awardedRef.current = false; }}>
            Play Again
          </button>
        </div>
      )}

      {(running || finished) && (
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50 to-rose-50 ring-1 ring-gold/30 touch-none select-none"
          style={{ height: 340 }}
          onPointerMove={onMove}
          onTouchMove={onTouch}
        >
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={it.id}
                className="pointer-events-none absolute text-2xl"
                style={{ left: `${it.x}%`, top: `${it.y}%`, transform: "translate(-50%,-50%)" }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {it.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Basket */}
          <div
            className="pointer-events-none absolute flex items-center justify-center transition-transform duration-75"
            style={{ bottom: 16, left: `${basket}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-4xl">🧺</span>
          </div>
        </div>
      )}
    </div>
  );
}
