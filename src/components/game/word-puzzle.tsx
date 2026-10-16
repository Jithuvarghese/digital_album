"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

type Puzzle = { word: string; hint: string; emoji: string };

const PUZZLES: Puzzle[] = [
  { word: "MUHURTHAM", hint: "The auspicious wedding hour", emoji: "⏰" },
  { word: "SADYA", hint: "Grand feast served on banana leaf", emoji: "🍌" },
  { word: "THALI", hint: "Sacred necklace tied by the groom", emoji: "💛" },
  { word: "MANDAPAM", hint: "The decorated wedding stage", emoji: "🌸" },
  { word: "KASAVU", hint: "Kerala's golden-bordered saree", emoji: "👘" },
  { word: "KANYADANAM", hint: "The ritual of gifting the bride", emoji: "🙏" },
];

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function WordPuzzle({ onPoints }: { onPoints: (n: number) => void }) {
  const [puzzles] = useState(() => shuffle(PUZZLES).slice(0, 4));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [hints, setHints] = useState<number[]>([]);
  const awardedRef = useRef(false);

  const current = puzzles[index];
  const scrambled = useState(() => puzzles.map((p) => shuffle(p.word.split("")).join("")))[0];

  const check = () => {
    if (input.trim().toUpperCase() === current.word) {
      const pts = hints.includes(index) ? 5 : 10;
      setScore((s) => s + pts);
      setResult("correct");
      setTimeout(() => {
        if (index + 1 >= puzzles.length) {
          setDone(true);
          if (!awardedRef.current) {
            awardedRef.current = true;
            onPoints(score + pts);
          }
        } else {
          setIndex((i) => i + 1);
          setInput("");
          setResult(null);
        }
      }, 700);
    } else {
      setResult("wrong");
      setTimeout(() => setResult(null), 600);
    }
  };

  const showHint = () => {
    if (!hints.includes(index)) setHints((h) => [...h, index]);
  };

  if (!started) {
    return (
      <div className="card mx-auto max-w-sm p-6 text-center">
        <p className="text-3xl">🔤</p>
        <h3 className="mt-2 font-serif text-2xl text-maroon">Unscramble the Word</h3>
        <p className="mt-2 text-sm text-muted">Unscramble wedding-related words to earn points!</p>
        <button className="btn-primary mt-4 w-full" onClick={() => setStarted(true)}>Start Game</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card mx-auto max-w-sm p-6 text-center">
        <p className="text-3xl">🎊</p>
        <h3 className="mt-2 font-serif text-2xl text-maroon">All done!</h3>
        <p className="mt-1 text-muted">{score} points earned</p>
        <button
          className="btn-primary mt-4 w-full"
          onClick={() => { setIndex(0); setInput(""); setResult(null); setScore(0); setDone(false); setHints([]); awardedRef.current = false; }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-sm items-center justify-between text-sm font-semibold text-muted">
        <span>{index + 1} / {puzzles.length}</span>
        <span>Score: {score}</span>
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card w-full max-w-sm p-6 text-center"
      >
        <p className="text-3xl">{current.emoji}</p>
        <p className="mt-3 font-mono text-2xl font-bold tracking-[0.2em] text-maroon">
          {scrambled[index]}
        </p>
        <p className="mt-2 text-sm text-muted italic">{hints.includes(index) ? `Hint: ${current.hint}` : "Hint hidden (+5 pts with hint)"}</p>

        <motion.input
          animate={result === "wrong" ? { x: [-6, 6, -6, 6, 0] } : {}}
          transition={{ duration: 0.3 }}
          className={`input mt-4 text-center font-mono tracking-widest uppercase ${result === "correct" ? "ring-green-400" : result === "wrong" ? "ring-maroon" : ""}`}
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === "Enter") check(); }}
          placeholder="TYPE HERE"
          maxLength={15}
          autoCapitalize="characters"
        />

        <div className="mt-4 flex gap-3">
          <button className="btn-ghost btn-sm flex-1" onClick={showHint} disabled={hints.includes(index)}>
            💡 Hint (-5 pts)
          </button>
          <button className="btn-primary flex-1" onClick={check} disabled={!input.trim()}>
            Check →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
