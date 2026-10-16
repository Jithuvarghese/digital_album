"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const SYMBOLS = ["💍", "🌸", "🪔", "🌺", "🥥", "🌿", "🐘", "🌙"];

type Card = { id: number; symbol: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryMatch({ onPoints }: { onPoints: (n: number) => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const awardedRef = useRef(false);
  const lockRef = useRef(false);

  const init = useCallback(() => {
    const deck = shuffle([...SYMBOLS, ...SYMBOLS]).map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }));
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setFinished(false);
    setScore(0);
    awardedRef.current = false;
    lockRef.current = false;
    setStarted(true);
  }, []);

  const flip = (id: number) => {
    if (lockRef.current) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const nowSelected = [...selected, id];
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setSelected(nowSelected);

    if (nowSelected.length === 2) {
      setMoves((m) => m + 1);
      lockRef.current = true;
      const [a, b] = nowSelected.map((sid) => cards.find((c) => c.id === sid)!);
      if (a.symbol === b.symbol) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (nowSelected.includes(c.id) ? { ...c, matched: true } : c)));
          setSelected([]);
          lockRef.current = false;
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (nowSelected.includes(c.id) ? { ...c, flipped: false } : c)));
          setSelected([]);
          lockRef.current = false;
        }, 900);
      }
    }
  };

  useEffect(() => {
    if (!started || finished) return;
    const allMatched = cards.length > 0 && cards.every((c) => c.matched);
    if (allMatched) {
      const pts = Math.max(10, 50 - moves * 2);
      setScore(pts);
      setFinished(true);
      if (!awardedRef.current) {
        awardedRef.current = true;
        onPoints(pts);
      }
    }
  }, [cards, started, finished, moves, onPoints]);

  if (!started) {
    return (
      <div className="card mx-auto max-w-sm p-6 text-center">
        <p className="text-3xl">🪔</p>
        <h3 className="mt-2 font-serif text-2xl text-maroon">Wedding Memory Match</h3>
        <p className="mt-2 text-sm text-muted">Find all the matching pairs of wedding symbols!</p>
        <button className="btn-primary mt-4 w-full" onClick={init}>Start Game</button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="card mx-auto max-w-sm p-6 text-center">
        <p className="text-3xl">✨</p>
        <h3 className="mt-2 font-serif text-2xl text-maroon">Matched!</h3>
        <p className="mt-1 text-muted">{moves} moves · +{score} points</p>
        <button className="btn-primary mt-4 w-full" onClick={init}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-semibold text-muted">Moves: {moves}</p>
      <div className="grid grid-cols-4 gap-2.5 px-2">
        {cards.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => flip(c.id)}
            whileTap={{ scale: 0.92 }}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ring-1 transition ${
              c.matched
                ? "bg-green-50 ring-green-200 opacity-50"
                : c.flipped
                ? "bg-gold/15 ring-gold/50"
                : "bg-maroon/5 ring-gold/20 hover:bg-maroon/10"
            }`}
          >
            <motion.span
              animate={{ rotateY: c.flipped || c.matched ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {c.flipped || c.matched ? c.symbol : "🌸"}
            </motion.span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
