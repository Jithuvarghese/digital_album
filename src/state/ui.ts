"use client";

import { create } from "zustand";
import type { Phase } from "@/config/wedding.config";
import { useSettings } from "@/data/hooks";
import { resolvePhase } from "@/lib/phase";
import { useDevice } from "./device";
import { localize, translate, type StringKey } from "@/lib/i18n";
import type { Localized } from "@/config/wedding.config";

/** Session-only UI state (not persisted across visits). */
interface UiState {
  phaseOverride: Phase | null;
  presenter: boolean;
  adminUnlocked: boolean;
  toast: string | null;
  setPhaseOverride: (p: Phase | null) => void;
  setPresenter: (v: boolean) => void;
  setAdminUnlocked: (v: boolean) => void;
  showToast: (msg: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useUi = create<UiState>((set) => ({
  phaseOverride: null,
  presenter: true,
  adminUnlocked: false,
  toast: null,
  setPhaseOverride: (phaseOverride) => {
    try {
      if (phaseOverride) sessionStorage.setItem("album-phase", phaseOverride);
      else sessionStorage.removeItem("album-phase");
    } catch {}
    set({ phaseOverride });
  },
  setPresenter: (presenter) => set({ presenter }),
  setAdminUnlocked: (adminUnlocked) => set({ adminUnlocked }),
  showToast: (toast) => {
    clearTimeout(toastTimer);
    set({ toast });
    toastTimer = setTimeout(() => set({ toast: null }), 3200);
  },
}));

export function usePhase(): Phase {
  const setting = useSettings((s) => s.settings.phase);
  const override = useUi((s) => s.phaseOverride);
  return resolvePhase(setting, override);
}

export function useT() {
  const lang = useDevice((s) => s.lang);
  return (key: StringKey) => translate(lang, key);
}

export function useLoc() {
  const lang = useDevice((s) => s.lang);
  return (value: Localized | undefined) => localize(value, lang);
}
