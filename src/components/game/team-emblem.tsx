"use client";

import Link from "next/link";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import type { Team } from "@/data/types";

export function TeamBadge({ team, size = 28 }: { team: Team; size?: number }) {
  const isBride = team === "bride";
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <circle cx="20" cy="20" r="19" fill={isBride ? "rgb(var(--c-bride))" : "rgb(var(--c-groom))"} />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="rgb(var(--c-gold))" strokeWidth="1.5" />
      {isBride ? (
        // Jasmine for Team Bride
        <g transform="translate(20 20)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5.5" rx="3.3" ry="5.5" fill="#fff" transform={`rotate(${a})`} />
          ))}
          <circle r="2.2" fill="#F2D27A" />
        </g>
      ) : (
        // Turban/peacock-feather style crest for Team Groom
        <g transform="translate(20 21)">
          <path d="M0 -11 C7 -6 7 4 0 9 C-7 4 -7 -6 0 -11Z" fill="#fff" />
          <circle cy="-1" r="3.2" fill="rgb(var(--c-gold))" />
          <circle cy="-1" r="1.4" fill="rgb(var(--c-groom))" />
        </g>
      )}
    </svg>
  );
}

export function TeamEmblem() {
  const team = useDevice((s) => s.team);
  const t = useT();
  if (!team) return null;
  return (
    <Link
      href="/play"
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full pl-1 pr-3 text-xs font-semibold text-jasmine ${team === "bride" ? "bg-bride" : "bg-groom"}`}
      aria-label={t(team === "bride" ? "team.bride" : "team.groom")}
    >
      <TeamBadge team={team} size={30} />
      <span className="hidden sm:inline">{t(team === "bride" ? "team.bride" : "team.groom")}</span>
    </Link>
  );
}
