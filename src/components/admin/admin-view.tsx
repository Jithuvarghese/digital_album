"use client";

import { useState } from "react";
import { getStore, isSupabaseConfigured } from "@/data";
import { useUi } from "@/state/ui";
import { Section } from "@/components/ui/primitives";
import { LockIcon } from "@/components/ui/icons";
import { Monogram } from "@/components/ui/ornaments";
import { Moderation } from "./moderation";
import { ContentTab, DownloadsTab, GameTab, RsvpTab } from "./admin-tabs";

type Tab = "moderation" | "rsvps" | "game" | "content" | "downloads";
const tabs: Array<{ id: Tab; label: string; emoji: string }> = [
  { id: "moderation", label: "Approve", emoji: "✅" },
  { id: "rsvps", label: "RSVPs", emoji: "📋" },
  { id: "game", label: "Game", emoji: "🏆" },
  { id: "content", label: "Settings", emoji: "⚙️" },
  { id: "downloads", label: "Downloads", emoji: "⬇️" },
];

function Login() {
  const setAdminUnlocked = useUi((s) => s.setAdminUnlocked);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card kasavu-frame mx-auto max-w-sm space-y-4 p-8 text-center"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await getStore().verifyAdmin(code).catch(() => false);
        setBusy(false);
        if (ok) setAdminUnlocked(true);
        else setError("That passcode is not right. Please ask the couple.");
      }}
    >
      <Monogram className="mx-auto h-16 w-16" />
      <h1 className="font-serif text-3xl text-maroon">Family login</h1>
      <p className="text-sm text-muted">For the couple and family members who help with photos, blessings and the game.</p>
      <label className="block text-left">
        <span className="label">Passcode</span>
        <input className="input text-center text-2xl tracking-[0.4em]" type="password" inputMode="numeric" autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
      </label>
      {error && <p role="alert" className="text-sm text-maroon">{error}</p>}
      <button className="btn-primary w-full min-h-[52px]" disabled={busy || !code}>
        <LockIcon size={18} /> {busy ? "Checking…" : "Open"}
      </button>
      {!isSupabaseConfigured && <p className="text-xs text-muted">Demo passcode: 1511</p>}
    </form>
  );
}

export function AdminView() {
  const unlocked = useUi((s) => s.adminUnlocked);
  const [tab, setTab] = useState<Tab>("moderation");

  return (
    <Section className="pt-6">
      <div className="container-wide">
        {!unlocked ? (
          <Login />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h1 className="font-serif text-3xl text-maroon">Family dashboard</h1>
              <button className="btn-ghost btn-sm" onClick={() => useUi.getState().setAdminUnlocked(false)}>
                Lock
              </button>
            </div>
            <div role="tablist" aria-label="Admin sections" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex min-h-[56px] shrink-0 items-center gap-2 rounded-2xl px-5 text-base font-semibold ring-1 ${tab === t.id ? "bg-maroon text-jasmine ring-maroon" : "bg-paper text-maroon ring-gold/40"}`}
                >
                  <span aria-hidden>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
            <div role="tabpanel">
              {tab === "moderation" && <Moderation />}
              {tab === "rsvps" && <RsvpTab />}
              {tab === "game" && <GameTab />}
              {tab === "content" && <ContentTab />}
              {tab === "downloads" && <DownloadsTab />}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
