"use client";

import { getStore } from "@/data";
import { useLive } from "@/data/hooks";
import type { Prediction, PredictionVote } from "@/data/types";
import { useDevice } from "@/state/device";
import { useUi } from "@/state/ui";
import { CheckIcon } from "@/components/ui/icons";
import { useGame } from "./use-game";

export function Predictions() {
  const { votes: myVotes, setVote, guestId, team, guestName } = useDevice();
  const { me, ended } = useGame();
  const toast = useUi((s) => s.showToast);
  const { data } = useLive<{ predictions: Prediction[]; votes: PredictionVote[] }>(
    ["predictions", "votes"],
    async (s) => ({ predictions: await s.listPredictions(), votes: await s.listVotes() }),
    { predictions: [], votes: [] },
  );

  const vote = async (p: Prediction, option: number) => {
    if (!team || p.revealedAnswer !== null || ended) return;
    setVote(p.id, option);
    try {
      const store = getStore();
      if (!me) await store.upsertGuest({ id: guestId, displayName: guestName || "Guest", team });
      await store.vote({ predictionId: p.id, guestId, team, option });
    } catch {
      toast("Could not save your vote.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Vote now. The family reveals the answers during the celebrations, and every correct guess earns 15 points.</p>
      {data.predictions.map((p) => {
        const votes = data.votes.filter((v) => v.predictionId === p.id);
        const mine = myVotes[p.id];
        const revealed = p.revealedAnswer !== null;
        return (
          <div key={p.id} className="card p-4">
            <h3 className="font-serif text-xl text-maroon">{p.question}</h3>
            <ul className="mt-3 space-y-2">
              {p.options.map((o, oi) => {
                const count = votes.filter((v) => v.option === oi).length;
                const pct = votes.length ? Math.round((count / votes.length) * 100) : 0;
                const isAnswer = revealed && p.revealedAnswer === oi;
                return (
                  <li key={oi}>
                    <button
                      onClick={() => vote(p, oi)}
                      disabled={revealed || ended}
                      aria-pressed={mine === oi}
                      className={`relative min-h-[48px] w-full overflow-hidden rounded-xl bg-jasmine px-4 text-left text-sm ring-1 transition ${mine === oi ? "ring-2 ring-maroon" : "ring-gold/40"} ${isAnswer ? "ring-2 ring-leaf" : ""}`}
                    >
                      <span className="absolute inset-y-0 left-0 bg-gold/20 transition-all" style={{ width: `${pct}%` }} aria-hidden />
                      <span className="relative flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          {isAnswer && <CheckIcon size={16} className="text-leaf" />}
                          {o}
                        </span>
                        <span className="text-xs text-muted">{pct}%</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {revealed && (
              <p className={`mt-3 text-sm font-semibold ${mine === p.revealedAnswer ? "text-leaf" : "text-muted"}`}>
                {mine === undefined ? "Revealed! You did not vote on this one." : mine === p.revealedAnswer ? "You called it! +15 points" : "Not this time. Better luck on the next one."}
              </p>
            )}
            {!revealed && <p className="mt-2 text-xs text-muted">{votes.length} votes so far</p>}
          </div>
        );
      })}
    </div>
  );
}
