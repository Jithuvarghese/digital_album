"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { getStore, type DataStore } from "./index";
import { defaultSettings } from "./seed";
import type { Collection, Settings, TeamTotals } from "./types";

/**
 * Loads data from the active store and reloads whenever one of `watch` changes
 * (in this tab, another tab, or another device in Supabase mode).
 */
export function useLive<T>(watch: Collection[], loader: (store: DataStore) => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const key = watch.join(",");

  const reload = useCallback(async () => {
    try {
      const result = await loaderRef.current(getStore());
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const collections = key.split(",");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = getStore().subscribe((c) => {
      if (!collections.includes(c)) return;
      clearTimeout(timer);
      timer = setTimeout(() => void reload(), 120);
    });
    return () => {
      clearTimeout(timer);
      off();
    };
  }, [key, reload]);

  return { data, loading, error, reload };
}

/** Shared, app-wide settings (phase, theme, modules, game status). */
export const useSettings = create<{ settings: Settings; loaded: boolean }>(() => ({
  settings: defaultSettings(),
  loaded: false,
}));

export function startSettingsSync() {
  const store = getStore();
  const load = () =>
    store
      .getSettings()
      .then((settings) => useSettings.setState({ settings, loaded: true }))
      .catch(() => useSettings.setState({ loaded: true }));
  void load();
  return store.subscribe((c) => {
    if (c === "settings") void load();
  });
}

export function useTeamTotals() {
  return useLive<TeamTotals>(
    ["scores", "guests"],
    async (s) => {
      const scores = await s.listScores();
      return scores.reduce<TeamTotals>((t, e) => ({ ...t, [e.team]: t[e.team] + e.points }), { bride: 0, groom: 0 });
    },
    { bride: 0, groom: 0 },
  );
}
