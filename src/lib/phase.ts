import { weddingConfig, type Phase } from "@/config/wedding.config";

/** Works out which phase the site is in from the wedding dates. */
export function phaseFromDate(now = new Date()): Phase {
  const start = new Date(weddingConfig.duringWindow.start).getTime();
  const end = new Date(weddingConfig.duringWindow.end).getTime();
  const t = now.getTime();
  if (t < start) return "before";
  if (t <= end) return "during";
  return "after";
}

export function resolvePhase(setting: Phase | "auto", override: Phase | null): Phase {
  if (override) return override;
  if (setting !== "auto") return setting;
  return phaseFromDate();
}
