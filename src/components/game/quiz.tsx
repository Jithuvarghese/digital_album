"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useDevice } from "@/state/device";
import { useUi } from "@/state/ui";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { useGame } from "./use-game";

const POINTS = 10;

export function Quiz() {
  const { quizDone, markQuizDone } = useDevice();
  const { award, ended } = useGame();
  const toast = useUi((s) => s.showToast);
  const questions = weddingConfig.quiz;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  if (quizDone && !finished) {
    return (
      <div className="card p-6 text-center">
        <p className="text-3xl" aria-hidden>🎓</p>
        <p className="mt-2 font-serif text-xl text-maroon">You have already played the couple quiz on this device.</p>
        <p className="mt-1 text-sm text-muted">Try the photo challenges and predictions for more points.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 text-center" role="status">
        <p className="text-5xl" aria-hidden>{correct >= 6 ? "🏆" : correct >= 3 ? "🌼" : "☕"}</p>
        <p className="mt-3 font-serif text-2xl text-maroon">
          {correct} / {questions.length} correct
        </p>
        <p className="mt-1 text-muted">+{correct * POINTS} points for your team</p>
        <p className="mt-3 text-sm">{correct >= 6 ? "You clearly know the couple. Or you were at that bookshop." : "Now you know their story. Go say hello to them!"}</p>
      </motion.div>
    );
  }

  const q = questions[i];
  const answer = (opt: number) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === q.answer) setCorrect((c) => c + 1);
  };

  const next = async () => {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    markQuizDone();
    try {
      await award("quiz", correct * POINTS);
    } catch {
      toast(ended ? "The game has ended, points were not added." : "Could not save your score. Please check your connection.");
    }
  };

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          Question {i + 1} of {questions.length}
        </span>
        <span>{correct * POINTS} pts</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gold/20">
        <motion.div className="h-full bg-maroon" animate={{ width: `${((i + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <h3 className="font-serif text-2xl text-maroon">{q.q}</h3>
          <ul className="mt-4 space-y-2">
            {q.options.map((o, oi) => {
              const isAnswer = oi === q.answer;
              const isPicked = oi === picked;
              const state = picked === null ? "" : isAnswer ? "bg-leaf text-jasmine ring-leaf" : isPicked ? "bg-maroon/10 ring-maroon text-maroon" : "opacity-60";
              return (
                <li key={oi}>
                  <button
                    onClick={() => answer(oi)}
                    disabled={picked !== null}
                    className={`flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl bg-jasmine px-4 text-left ring-1 ring-gold/40 transition hover:ring-maroon ${state}`}
                  >
                    {o}
                    {picked !== null && isAnswer && <CheckIcon size={20} />}
                    {picked !== null && isPicked && !isAnswer && <CloseIcon size={20} />}
                  </button>
                </li>
              );
            })}
          </ul>
          {picked !== null && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-gold/15 p-3 text-sm" role="status">
              <p className="font-semibold text-maroon">{picked === q.answer ? `Correct! +${POINTS}` : "Not quite."}</p>
              <p className="mt-0.5">{q.explain}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <button className="btn-primary mt-5 w-full" disabled={picked === null} onClick={next}>
        {i + 1 < questions.length ? "Next question" : "See my score"}
      </button>
    </div>
  );
}
