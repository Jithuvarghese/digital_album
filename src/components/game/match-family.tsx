"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useDevice } from "@/state/device";
import { useUi } from "@/state/ui";
import { useGame } from "./use-game";

const POINTS = 5;

/** Deterministic shuffle so the board is stable across renders. */
function shuffle<T>(arr: T[], seed: number) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchFamily() {
  const { matchDone, markMatchDone, guestId } = useDevice();
  const { award } = useGame();
  const toast = useUi((s) => s.showToast);
  const seed = useMemo(() => [...guestId].reduce((a, c) => a + c.charCodeAt(0), 7), [guestId]);

  const people = useMemo(() => {
    const all = [...weddingConfig.families.bride.slice(0, 5), ...weddingConfig.families.groom.slice(0, 5)];
    return shuffle(all, seed).slice(0, 6);
  }, [seed]);
  const relations = useMemo(() => shuffle(people.map((p) => p.relation), seed + 3), [people, seed]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = matched.length === people.length;

  if (matchDone && !done) {
    return (
      <div className="card p-6 text-center">
        <p className="text-3xl" aria-hidden>👨‍👩‍👧‍👦</p>
        <p className="mt-2 font-serif text-xl text-maroon">You have already matched the families on this device.</p>
        <p className="mt-1 text-sm text-muted">Use the &ldquo;Who&rsquo;s who&rdquo; search on the home page to meet everyone.</p>
      </div>
    );
  }

  const tryRelation = async (rel: string) => {
    if (!selected || matched.includes(selected)) return;
    const person = people.find((p) => p.name === selected)!;
    if (person.relation === rel) {
      const next = [...matched, selected];
      setMatched(next);
      setSelected(null);
      if (next.length === people.length) {
        markMatchDone();
        const pts = Math.max(0, people.length * POINTS - mistakes * 2);
        try {
          await award("match", pts);
          toast(`Family matched! +${pts} points`);
        } catch {
          toast("Could not save your score.");
        }
      }
    } else {
      setWrong(rel);
      setMistakes((m) => m + 1);
      setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <div className="card p-5">
      <p className="mb-4 text-sm text-muted">Tap a name, then tap how they are related to the couple. {POINTS} points per match, minus a little for wrong guesses.</p>
      <div className="grid grid-cols-2 gap-3">
        <ul className="space-y-2" aria-label="People">
          {people.map((p) => {
            const isMatched = matched.includes(p.name);
            return (
              <li key={p.name}>
                <button
                  disabled={isMatched}
                  aria-pressed={selected === p.name}
                  onClick={() => setSelected(p.name)}
                  className={`min-h-[56px] w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ring-1 transition ${isMatched ? "bg-leaf/15 text-leaf ring-leaf/40" : selected === p.name ? "bg-maroon text-jasmine ring-maroon" : "bg-jasmine ring-gold/40 hover:ring-maroon"}`}
                >
                  {p.name}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2" aria-label="Relations">
          {relations.map((r) => {
            const owner = people.find((p) => p.relation === r)!;
            const isMatched = matched.includes(owner.name);
            return (
              <li key={r}>
                <motion.button
                  animate={wrong === r ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  disabled={isMatched || !selected}
                  onClick={() => tryRelation(r)}
                  className={`min-h-[56px] w-full rounded-xl px-3 py-2 text-left text-xs ring-1 transition ${isMatched ? "bg-leaf/15 text-leaf ring-leaf/40" : wrong === r ? "bg-maroon/10 ring-maroon" : "bg-paper ring-gold/40 enabled:hover:ring-maroon"} disabled:cursor-default`}
                >
                  {r}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
      {done && (
        <p role="status" className="mt-4 rounded-xl bg-leaf/15 p-3 text-center text-sm font-semibold text-leaf">
          All matched! You now know more of the family than some cousins do.
        </p>
      )}
    </div>
  );
}
