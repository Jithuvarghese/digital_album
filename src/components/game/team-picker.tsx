"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { getStore } from "@/data";
import type { Team } from "@/data/types";
import { hasProfanity, sanitize } from "@/lib/text";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { TeamBadge } from "./team-emblem";

export function TeamPicker({ onDone, changing = false }: { onDone?: () => void; changing?: boolean }) {
  const t = useT();
  const { guestId, guestName, setGuestName, chooseTeam, team: current } = useDevice();
  const [name, setName] = useState(guestName);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const pick = async (team: Team) => {
    const clean = sanitize(name, 40);
    if (!clean) return setError("Tell us your name so it shows on the leaderboard.");
    if (hasProfanity(clean)) return setError("Please choose a family-friendly name.");
    setSaving(true);
    try {
      setGuestName(clean);
      await getStore().upsertGuest({ id: guestId, displayName: clean, team });
      chooseTeam(team);
      onDone?.();
    } catch {
      setError(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card kasavu-frame mx-auto max-w-lg p-6 text-center">
      <h2 className="font-serif text-3xl text-maroon">{changing ? "Switch sides?" : t("play.choose")}</h2>
      <p className="mt-2 text-sm text-muted">
        {changing ? "You can change your team only once. Your points come with you." : "Every quiz answer, photo challenge and prediction adds to your team's score on the big screen."}
      </p>
      {!changing && (
        <div className="mx-auto mt-5 max-w-xs text-left">
          <label className="label" htmlFor="game-name">{t("upload.name")}</label>
          <input id="game-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" />
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(["bride", "groom"] as Team[]).map((team) => (
          <motion.button
            key={team}
            whileTap={{ scale: 0.96 }}
            disabled={saving || current === team}
            onClick={() => pick(team)}
            className={`flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl p-4 text-jasmine shadow-card disabled:opacity-50 ${team === "bride" ? "bg-bride" : "bg-groom"}`}
          >
            <TeamBadge team={team} size={64} />
            <span className="font-serif text-xl">{t(team === "bride" ? "team.bride" : "team.groom")}</span>
            <span className="text-xs text-jasmine/80">{team === "bride" ? "Jasmine & grace" : "Peacock & pride"}</span>
          </motion.button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-maroon">{error}</p>}
    </div>
  );
}
