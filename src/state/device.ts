"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { weddingConfig, type Lang } from "@/config/wedding.config";
import type { Team } from "@/data/types";
import { uid } from "@/lib/id";

/** Per-device preferences and progress. Nothing here is shared with other guests. */
interface DeviceState {
  hydrated: boolean;
  lang: Lang;
  introSeen: boolean;
  guestId: string;
  guestName: string;
  team: Team | null;
  teamChanges: number;
  quizDone: boolean;
  matchDone: boolean;
  challengesSubmitted: string[];
  likedPhotos: string[];
  votes: Record<string, number>;
  postTimes: number[];

  setLang: (lang: Lang) => void;
  setIntroSeen: (seen: boolean) => void;
  setGuestName: (name: string) => void;
  chooseTeam: (team: Team) => void;
  markQuizDone: () => void;
  markMatchDone: () => void;
  addChallenge: (id: string) => void;
  toggleLike: (id: string) => boolean;
  setVote: (predictionId: string, option: number) => void;
  /** Simple client-side rate limit: max `limit` posts per `windowMs`. Returns false if blocked. */
  allowPost: (limit?: number, windowMs?: number) => boolean;
  resetProgress: () => void;
}

export const useDevice = create<DeviceState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      lang: weddingConfig.defaultLanguage,
      introSeen: false,
      guestId: "",
      guestName: "",
      team: null,
      teamChanges: 0,
      quizDone: false,
      matchDone: false,
      challengesSubmitted: [],
      likedPhotos: [],
      votes: {},
      postTimes: [],

      setLang: (lang) => set({ lang }),
      setIntroSeen: (introSeen) => set({ introSeen }),
      setGuestName: (guestName) => set({ guestName: guestName.slice(0, 40) }),
      chooseTeam: (team) =>
        set((s) => ({ team, teamChanges: s.team && s.team !== team ? s.teamChanges + 1 : s.teamChanges })),
      markQuizDone: () => set({ quizDone: true }),
      markMatchDone: () => set({ matchDone: true }),
      addChallenge: (id) => set((s) => ({ challengesSubmitted: [...new Set([...s.challengesSubmitted, id])] })),
      toggleLike: (id) => {
        const liked = get().likedPhotos.includes(id);
        set((s) => ({ likedPhotos: liked ? s.likedPhotos.filter((x) => x !== id) : [...s.likedPhotos, id] }));
        return !liked;
      },
      setVote: (predictionId, option) => set((s) => ({ votes: { ...s.votes, [predictionId]: option } })),
      allowPost: (limit = 5, windowMs = 60_000) => {
        const now = Date.now();
        const recent = get().postTimes.filter((t) => now - t < windowMs);
        if (recent.length >= limit) return false;
        set({ postTimes: [...recent, now] });
        return true;
      },
      resetProgress: () =>
        set({ team: null, teamChanges: 0, quizDone: false, matchDone: false, challengesSubmitted: [], likedPhotos: [], votes: {}, guestId: uid() }),
    }),
    {
      name: "album-device",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) => {
        void _h;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function"));
      },
      onRehydrateStorage: () => (state) => {
        if (state && !state.guestId) state.guestId = uid();
        useDevice.setState({ hydrated: true, guestId: state?.guestId || uid() });
      },
    },
  ),
);
