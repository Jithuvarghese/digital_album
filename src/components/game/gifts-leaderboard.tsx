"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { weddingConfig } from "@/config/wedding.config";
import type { Guest, Team } from "@/data/types";
import { useT } from "@/state/ui";
import { GiftIcon, LockIcon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/primitives";
import { Jasmine } from "@/components/ui/ornaments";
import { TeamBadge } from "./team-emblem";

export function Gifts({ points }: { points: number }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {weddingConfig.gifts.map((g) => {
        const unlocked = points >= g.unlockAt;
        const pct = Math.min(100, Math.round((points / g.unlockAt) * 100));
        return (
          <li key={g.id}>
            <motion.div
              initial={false}
              animate={unlocked ? { rotateY: [90, 0] } : {}}
              className={`card relative flex h-full flex-col overflow-hidden p-5 ${unlocked ? "kasavu-frame" : ""}`}
            >
              <span className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full ${unlocked ? "bg-turmeric text-ink" : "bg-ink/10 text-muted"}`}>
                {unlocked ? <GiftIcon /> : <LockIcon />}
              </span>
              <h3 className="font-serif text-xl text-maroon">{g.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink/80">{unlocked ? g.description : `Unlocks at ${g.unlockAt} points.`}</p>
              {unlocked ? (
                <Link href={g.href} className="btn-primary btn-sm mt-4 self-start">
                  Open gift
                </Link>
              ) : (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-gold/20">
                    <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{Math.max(0, g.unlockAt - points)} points to go</p>
                </div>
              )}
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

export function Leaderboard({ guests, myId, limit = 10, offset = 0, large = false }: { guests: Guest[]; myId?: string; limit?: number; offset?: number; large?: boolean }) {
  const t = useT();
  const top = guests.filter((g) => g.points > 0).slice(offset, offset + limit);
  if (!top.length) return <p className="card p-5 text-center text-muted">No scores yet. The first point could be yours!</p>;
  return (
    <ol className="space-y-2">
      {top.map((g, i) => (
        <li
          key={g.id}
          className={`flex items-center gap-3 rounded-2xl px-3 py-2 ring-1 ${g.id === myId ? "bg-turmeric/15 ring-turmeric" : "bg-paper ring-gold/20"} ${large ? "py-3 text-2xl" : ""}`}
        >
          <span className={`w-7 text-center font-serif font-semibold text-maroon ${large ? "w-12 text-3xl" : "text-lg"}`}>{i + offset < 3 ? ["🥇", "🥈", "🥉"][i + offset] : i + offset + 1}</span>
          <Avatar name={g.displayName} size={large ? 52 : 36} />
          <span className="min-w-0 flex-1 truncate font-medium">
            {g.displayName}
            {g.id === myId && <span className="ml-1 text-xs text-muted">({t("play.you")})</span>}
          </span>
          <TeamBadge team={g.team} size={large ? 36 : 22} />
          <span className="w-14 text-right font-serif font-semibold tabular-nums text-maroon">{g.points}</span>
        </li>
      ))}
    </ol>
  );
}

export function Celebration({ winner, large = false }: { winner: Team | null; large?: boolean }) {
  const t = useT();
  const reduce = useReducedMotion();
  const petals = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ left: (i * 41) % 100, delay: (i % 7) * 0.35, size: 14 + (i % 4) * 6 })), []);
  const color = winner === "bride" ? "bg-bride" : winner === "groom" ? "bg-groom" : "bg-maroon";
  return (
    <div className={`relative overflow-hidden rounded-[28px] ${color} text-center text-jasmine ${large ? "flex h-full flex-col items-center justify-center p-16" : "p-8"}`}>
      {!reduce &&
        petals.map((p, i) => (
          <motion.div key={i} aria-hidden className="absolute -top-8" style={{ left: `${p.left}%` }} animate={{ y: ["0%", "1400%"], rotate: [0, 360] }} transition={{ duration: 5, delay: p.delay, repeat: Infinity, ease: "linear" }}>
            <Jasmine size={p.size} />
          </motion.div>
        ))}
      <div className="relative">
        {winner && <TeamBadge team={winner} size={large ? 180 : 96} />}
        <p className={`mt-4 uppercase tracking-[0.3em] text-gold ${large ? "text-3xl" : "text-xs"}`}>And the winner is</p>
        <p className={`font-serif ${large ? "text-[9rem] leading-none" : "text-5xl"}`}>{winner ? t(winner === "bride" ? "team.bride" : "team.groom") : "Both families!"}</p>
        <p className={`mt-3 text-jasmine/85 ${large ? "text-3xl" : ""}`}>Thank you for playing. The real prize: two families, now one.</p>
      </div>
    </div>
  );
}
