"use client";

import { getStore } from "@/data";
import { useLive, useSettings } from "@/data/hooks";
import type { Guest, ScoreSource } from "@/data/types";
import { useDevice } from "@/state/device";

/** The current guest's game identity, points and a helper to award points. */
export function useGame() {
  const { guestId, guestName, team } = useDevice();
  const settings = useSettings((s) => s.settings);
  const guests = useLive<Guest[]>(["guests", "scores"], (s) => s.listGuests(), []);
  const me = guests.data.find((g) => g.id === guestId) ?? null;
  const ended = settings.gameStatus === "ended";

  const award = async (source: ScoreSource, points: number) => {
    if (!team || points <= 0 || ended) return;
    const store = getStore();
    if (!me) await store.upsertGuest({ id: guestId, displayName: guestName || "Guest", team });
    await store.addScore({ guestId, team, source, points });
  };

  return { guestId, guestName, team, me, myPoints: me?.points ?? 0, guests: guests.data, loading: guests.loading, ended, winner: settings.winner, award };
}
