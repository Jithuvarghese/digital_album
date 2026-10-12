"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { weddingConfig, type Lang, type Phase, type ThemeName } from "@/config/wedding.config";
import { getStore, isSupabaseConfigured } from "@/data";
import { useSettings } from "@/data/hooks";
import { languageNames } from "@/lib/i18n";
import { useSimulation } from "@/lib/simulate";
import { useDevice } from "@/state/device";
import { usePhase, useUi } from "@/state/ui";
import { CloseIcon, SparkleIcon, TvIcon } from "@/components/ui/icons";

/** Demo helper for sales presentations. Hidden with ?presenter=0 and never shown when Supabase is configured. */
export function PresenterMenu() {
  const visible = useUi((s) => s.presenter);
  const { phaseOverride, setPhaseOverride, showToast } = useUi();
  const phase = usePhase();
  const theme = useSettings((s) => s.settings.theme);
  const { lang, setLang, resetProgress, setIntroSeen } = useDevice();
  const sim = useSimulation();
  const [open, setOpen] = useState(false);

  if (!visible || isSupabaseConfigured) return null;

  const setPhase = (p: Phase) => {
    setPhaseOverride(null);
    void getStore().updateSettings({ phase: p });
    if (window.location.pathname !== "/") window.location.href = "/";
  };

  const chip = (active: boolean) => `min-h-[40px] rounded-full px-3 text-xs font-semibold ring-1 transition ${active ? "bg-jasmine text-ink ring-jasmine" : "text-jasmine ring-jasmine/30 hover:bg-white/10"}`;

  return (
    <div className="no-print fixed bottom-[84px] left-3 z-50 lg:bottom-4">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="mb-2 w-[300px] space-y-3 rounded-2xl bg-ink/95 p-4 text-jasmine shadow-2xl backdrop-blur"
            role="dialog"
            aria-label="Demo helper"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Demo helper</p>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close demo helper">
                <CloseIcon size={18} />
              </button>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-jasmine/60">Wedding stage {phaseOverride ? "(preview)" : ""}</p>
              <div className="flex gap-1.5">
                {(["before", "during", "after"] as Phase[]).map((p) => (
                  <button key={p} className={chip(phase === p)} onClick={() => setPhase(p)}>
                    {p === "before" ? "Before" : p === "during" ? "During" : "After"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-jasmine/60">Theme</p>
              <div className="flex gap-1.5">
                {(Object.keys(weddingConfig.themes) as ThemeName[]).map((t) => (
                  <button key={t} className={`${chip(theme === t)} capitalize`} onClick={() => getStore().updateSettings({ theme: t })}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-jasmine/60">Language</p>
              <div className="flex gap-1.5">
                {weddingConfig.languages.map((l: Lang) => (
                  <button key={l} className={chip(lang === l)} onClick={() => setLang(l)}>
                    {languageNames[l]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a href="/live" target="_blank" rel="noopener" className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20">
                <TvIcon size={16} /> Live screen
              </a>
              <button
                className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold ${sim.running ? "bg-turmeric text-ink" : "bg-white/10 hover:bg-white/20"}`}
                onClick={sim.toggle}
                aria-pressed={sim.running}
              >
                <SparkleIcon size={16} /> {sim.running ? "Simulating…" : "Simulate guests"}
              </button>
              <button
                className="min-h-[44px] rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
                onClick={() => {
                  setIntroSeen(false);
                  window.location.href = "/";
                }}
              >
                Replay intro
              </button>
              <button
                className="min-h-[44px] rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
                onClick={async () => {
                  if (!confirm("Reset all demo data to the original sample?")) return;
                  sim.stop();
                  await getStore().reset();
                  resetProgress();
                  setPhaseOverride(null);
                  showToast("Demo data reset");
                }}
              >
                Reset demo data
              </button>
            </div>
            <p className="text-[10px] leading-snug text-jasmine/50">Add ?presenter=0 to the link to hide this menu.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold shadow-card ${open ? "bg-ink text-jasmine" : "bg-ink/80 text-jasmine/90"}`}
      >
        <SparkleIcon size={16} /> Demo
        {sim.running && <span className="h-2 w-2 animate-pulse rounded-full bg-turmeric" aria-label="simulation running" />}
      </button>
    </div>
  );
}
