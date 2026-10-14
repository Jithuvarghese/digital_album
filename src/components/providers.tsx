"use client";

import { useEffect } from "react";
import type { Phase } from "@/config/wedding.config";
import { startSettingsSync, useSettings } from "@/data/hooks";
import { isSupabaseConfigured } from "@/data";
import { useDevice } from "@/state/device";
import { useUi } from "@/state/ui";
import { Toast } from "@/components/ui/toast";

const PHASES: Phase[] = ["before", "during", "after"];

export function Providers({ children }: { children: React.ReactNode }) {
  const lang = useDevice((s) => s.lang);
  const theme = useSettings((s) => s.settings.theme);

  useEffect(() => {
    void useDevice.persist.rehydrate();
    const stop = startSettingsSync();

    // Hidden query options: ?phase=before|during|after and ?presenter=0
    const params = new URLSearchParams(window.location.search);
    const qp = params.get("phase") as Phase | null;
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem("album-phase");
    } catch {}
    const phase = qp && PHASES.includes(qp) ? qp : PHASES.includes(stored as Phase) ? (stored as Phase) : null;
    if (phase) useUi.getState().setPhaseOverride(phase);
    if (params.get("presenter") === "0") {
      try {
        sessionStorage.setItem("album-presenter", "0");
      } catch {}
    }
    if (params.get("presenter") === "1") {
      try {
        sessionStorage.setItem("album-presenter", "1");
      } catch {}
    }
    // Demo sites show the presenter menu unless hidden; connected sites only when opened with ?presenter=1
    try {
      const flag = sessionStorage.getItem("album-presenter");
      useUi.getState().setPresenter(isSupabaseConfigured ? flag === "1" : flag !== "0");
    } catch {
      useUi.getState().setPresenter(!isSupabaseConfigured);
    }
    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      {children}
      <Toast />
    </>
  );
}
