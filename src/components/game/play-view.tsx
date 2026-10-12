"use client";

import { useState } from "react";
import { useTeamTotals } from "@/data/hooks";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { Section, SectionHeader, Skeleton } from "@/components/ui/primitives";
import { TugOfWar } from "./scoreboard";
import { TeamBadge } from "./team-emblem";
import { TeamPicker } from "./team-picker";
import { Quiz } from "./quiz";
import { Challenges } from "./challenges";
import { Predictions } from "./predictions";
import { MatchFamily } from "./match-family";
import { Celebration, Gifts, Leaderboard } from "./gifts-leaderboard";
import { useGame } from "./use-game";

type Mode = "quiz" | "challenges" | "predictions" | "match" | "gifts" | "leaderboard";

export function PlayView() {
  const t = useT();
  const hydrated = useDevice((s) => s.hydrated);
  const teamChanges = useDevice((s) => s.teamChanges);
  const { team, me, myPoints, guests, guestId, ended, winner } = useGame();
  const totals = useTeamTotals().data;
  const [mode, setMode] = useState<Mode>("quiz");
  const [changing, setChanging] = useState(false);

  const modes: Array<{ id: Mode; label: string; emoji: string }> = [
    { id: "quiz", label: t("play.quiz"), emoji: "💬" },
    { id: "challenges", label: t("play.challenges"), emoji: "📸" },
    { id: "predictions", label: t("play.predictions"), emoji: "🔮" },
    { id: "match", label: t("play.match"), emoji: "🧩" },
    { id: "gifts", label: t("play.gifts"), emoji: "🎁" },
    { id: "leaderboard", label: t("play.leaderboard"), emoji: "🏆" },
  ];

  return (
    <Section className="pt-6">
      <div className="container-narrow">
        <SectionHeader title={t("play.title")} subtitle="Two families, one friendly rivalry. Every point shows up on the big screen at the venue." />

        <div className="card mb-6 p-5 pt-8">
          <TugOfWar totals={totals} />
        </div>

        {ended && (
          <div className="mb-6">
            <Celebration winner={winner} />
          </div>
        )}

        {!hydrated ? (
          <Skeleton className="h-64" />
        ) : !team || changing ? (
          <TeamPicker changing={changing} onDone={() => setChanging(false)} />
        ) : (
          <>
            <div className={`mb-5 flex items-center gap-3 rounded-2xl p-3 text-jasmine ${team === "bride" ? "bg-bride" : "bg-groom"}`}>
              <TeamBadge team={team} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{me?.displayName ?? "You"}</p>
                <p className="text-sm text-jasmine/85">
                  {t(team === "bride" ? "team.bride" : "team.groom")} · {myPoints} {t("play.points")}
                </p>
              </div>
              {teamChanges < 1 && !ended && (
                <button className="btn btn-sm bg-jasmine/15 text-jasmine ring-1 ring-jasmine/40 hover:bg-jasmine/25" onClick={() => setChanging(true)}>
                  Switch team
                </button>
              )}
            </div>

            <div role="tablist" aria-label="Games" className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 transition ${mode === m.id ? "bg-maroon text-jasmine ring-maroon" : "bg-paper text-maroon ring-gold/40"}`}
                >
                  <span aria-hidden>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {mode === "quiz" && <Quiz />}
              {mode === "challenges" && <Challenges />}
              {mode === "predictions" && <Predictions />}
              {mode === "match" && <MatchFamily />}
              {mode === "gifts" && <Gifts points={myPoints} />}
              {mode === "leaderboard" && (
                <div className="space-y-4">
                  <Leaderboard guests={guests} myId={guestId} />
                  {(() => {
                    const rank = guests.findIndex((g) => g.id === guestId);
                    return rank >= 10 ? <p className="text-center text-sm text-muted">You are #{rank + 1}. Keep going!</p> : null;
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
