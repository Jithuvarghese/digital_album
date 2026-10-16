"use client";

import { useEffect, useRef, useState } from "react";


// y is in pixels; x is percent of arena width
type Item = { id: number; x: number; y: number; emoji: string; speed: number };

const ARENA_H = 380;
const BASKET_BOTTOM = 52; // px from bottom
const CATCH_BAND_TOP = ARENA_H - BASKET_BOTTOM - 28;
const CATCH_BAND_BOT = ARENA_H - BASKET_BOTTOM + 8;

let nextId = 0;
const ITEMS = ["🍫", "🍫", "🍬", "🍬", "💖", "🧁", "🍫", "💐"];

export function CatchGame({ onPoints }: { onPoints: (n: number) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [basketPct, setBasketPct] = useState(50);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);

  // Refs so the rAF loop never needs to re-register
  const basketRef = useRef(50);   // % position
  const itemsRef = useRef<Item[]>([]);
  const runningRef = useRef(false);
  const caughtRef = useRef(0);
  const missedRef = useRef(0);
  const spawnAccRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const awardedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { basketRef.current = basketPct; }, [basketPct]);

  const loop = useRef<(ts: number) => void>(() => {});
  loop.current = (ts: number) => {
    if (!runningRef.current) return;

    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.1);
    lastTsRef.current = ts;
    spawnAccRef.current += dt;

    // Move items down — speed is px/s
    let next = itemsRef.current.map((it) => ({ ...it, y: it.y + it.speed * dt }));

    // Catch / miss detection
    let nc = 0, nm = 0;
    next = next.filter((it) => {
      if (it.y >= CATCH_BAND_TOP && it.y <= CATCH_BAND_BOT) {
        const half = 10; // % of arena width
        if (it.x >= basketRef.current - half && it.x <= basketRef.current + half) {
          nc++;
          return false;
        }
      }
      if (it.y > ARENA_H) {
        nm++;
        return false;
      }
      return true;
    });

    if (nc > 0) { caughtRef.current += nc; setCaught(caughtRef.current); }
    if (nm > 0) { missedRef.current += nm; setMissed(missedRef.current); }

    // Spawn new item every ~1.1 s
    if (spawnAccRef.current >= 1.1) {
      spawnAccRef.current = 0;
      next.push({
        id: ++nextId,
        x: 8 + Math.random() * 84,
        y: -30,
        emoji: ITEMS[Math.floor(Math.random() * ITEMS.length)],
        speed: 90 + Math.random() * 70, // px/s — visible, catchable
      });
    }

    itemsRef.current = next;
    setItems([...next]);

    rafRef.current = requestAnimationFrame((t) => loop.current!(t));
  };

  const start = () => {
    nextId = 0;
    itemsRef.current = [];
    caughtRef.current = 0;
    missedRef.current = 0;
    spawnAccRef.current = 0;
    awardedRef.current = false;
    setItems([]);
    setCaught(0);
    setMissed(0);
    setTimeLeft(30);
    setFinished(false);
    runningRef.current = true;
    setRunning(true);
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame((t) => loop.current!(t));
  };

  const stop = () => {
    runningRef.current = false;
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFinished(true);
    if (!awardedRef.current) {
      awardedRef.current = true;
      onPoints(caughtRef.current * 2);
    }
  };

  // Countdown timer — separate from rAF
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); stop(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const moveBasket = (clientX: number) => {
    const el = arenaRef.current;
    if (!el || !runningRef.current) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(91, Math.max(9, ((clientX - rect.left) / rect.width) * 100));
    basketRef.current = pct;
    setBasketPct(pct);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scoreboard */}
      <div className="flex w-full max-w-sm items-center justify-between rounded-2xl bg-maroon/5 px-4 py-2 text-sm font-semibold text-maroon">
        <span>⏱ {timeLeft}s</span>
        <span>Caught: {caught}</span>
        <span>Missed: {missed}</span>
      </div>

      {/* Start screen */}
      {!running && !finished && (
        <div className="card w-full max-w-sm p-6 text-center">
          <p className="text-3xl">🍫</p>
          <h3 className="mt-2 font-serif text-2xl text-maroon">Catch the Treats!</h3>
          <p className="mt-2 text-sm text-muted">
            Move your finger (or mouse) to move the basket. Catch chocolates and hearts — don&apos;t miss the 💖!
          </p>
          <button className="btn-primary mt-4 w-full" onClick={start}>
            Start Game
          </button>
        </div>
      )}

      {/* Finish screen */}
      {finished && (
        <div className="card w-full max-w-sm p-6 text-center">
          <p className="text-3xl">🎉</p>
          <h3 className="mt-2 font-serif text-2xl text-maroon">Well done!</h3>
          <p className="mt-1 text-muted">You caught {caught} treats! +{caught * 2} points</p>
          <button className="btn-primary mt-4 w-full" onClick={start}>
            Play Again
          </button>
        </div>
      )}

      {/* Game arena — always rendered when running or just finished so items are visible */}
      {(running || finished) && (
        <div
          ref={arenaRef}
          className="relative w-full max-w-sm touch-none select-none overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50 to-rose-50 ring-1 ring-gold/30"
          style={{ height: ARENA_H }}
          onPointerMove={(e) => moveBasket(e.clientX)}
          onTouchMove={(e) => { e.preventDefault(); moveBasket(e.touches[0].clientX); }}
          onPointerDown={(e) => moveBasket(e.clientX)}
          onTouchStart={(e) => moveBasket(e.touches[0].clientX)}
        >
          {/* Falling items — no AnimatePresence, plain divs for perf */}
          {items.map((it) => (
            <div
              key={it.id}
              className="pointer-events-none absolute text-2xl leading-none"
              style={{ left: `${it.x}%`, top: it.y, transform: "translate(-50%,-50%)" }}
            >
              {it.emoji}
            </div>
          ))}

          {/* Basket */}
          <div
            className="pointer-events-none absolute"
            style={{ bottom: BASKET_BOTTOM - 36, left: `${basketPct}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-4xl leading-none">🧺</span>
          </div>

          {/* Ground line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold/20" />
        </div>
      )}
    </div>
  );
}
