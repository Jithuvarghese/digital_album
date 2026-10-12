"use client";

import { motion } from "framer-motion";
import { useTeamTotals } from "@/data/hooks";
import type { TeamTotals } from "@/data/types";
import { useT } from "@/state/ui";
import { TeamBadge } from "./team-emblem";

/** Tug-of-war bar: the rope marker moves toward the leading team. */
export function TugOfWar({ totals, large = false }: { totals: TeamTotals; large?: boolean }) {
  const t = useT();
  const sum = totals.bride + totals.groom;
  const share = sum ? totals.bride / sum : 0.5;
  return (
    <div className="w-full" role="img" aria-label={`${t("team.bride")} ${totals.bride}, ${t("team.groom")} ${totals.groom}`}>
      <div className={`flex items-end justify-between ${large ? "mb-6" : "mb-2"}`}>
        <div className="flex items-center gap-2">
          <TeamBadge team="bride" size={large ? 72 : 34} />
          <div>
            <p className={`font-semibold text-bride ${large ? "text-3xl" : "text-xs"}`}>{t("team.bride")}</p>
            <motion.p key={totals.bride} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className={`font-serif tabular-nums text-ink ${large ? "text-7xl" : "text-2xl"}`}>
              {totals.bride}
            </motion.p>
          </div>
        </div>
        <div className="flex flex-row-reverse items-center gap-2 text-right">
          <TeamBadge team="groom" size={large ? 72 : 34} />
          <div>
            <p className={`font-semibold text-groom ${large ? "text-3xl" : "text-xs"}`}>{t("team.groom")}</p>
            <motion.p key={totals.groom} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className={`font-serif tabular-nums text-ink ${large ? "text-7xl" : "text-2xl"}`}>
              {totals.groom}
            </motion.p>
          </div>
        </div>
      </div>
      <div className={`relative overflow-hidden rounded-full bg-groom ${large ? "h-10" : "h-4"}`}>
        <motion.div className="absolute inset-y-0 left-0 bg-bride" animate={{ width: `${share * 100}%` }} transition={{ type: "spring", stiffness: 60, damping: 15 }} />
        <span className="absolute inset-y-0 left-1/2 w-0.5 bg-jasmine/70" aria-hidden />
      </div>
      <div className="relative h-0">
        <motion.span
          aria-hidden
          className={`absolute -translate-x-1/2 ${large ? "-top-[54px] text-5xl" : "-top-[22px] text-xl"}`}
          animate={{ left: `${share * 100}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          🪢
        </motion.span>
      </div>
    </div>
  );
}

export function LiveScoreboard() {
  const { data } = useTeamTotals();
  return <TugOfWar totals={data} />;
}
