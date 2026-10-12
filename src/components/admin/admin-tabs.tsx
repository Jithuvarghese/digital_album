"use client";

import { useMemo, useState } from "react";
import { weddingConfig, type ModuleKey, type Phase, type ThemeName } from "@/config/wedding.config";
import { getStore, isSupabaseConfigured } from "@/data";
import { useLive, useSettings, useTeamTotals } from "@/data/hooks";
import type { Blessing, CapsuleMessage, Photo, Prediction, PredictionVote, Rsvp, Team } from "@/data/types";
import { downloadFile } from "@/lib/calendar";
import { formatDate, toCsv } from "@/lib/text";
import { usePhase, useUi } from "@/state/ui";
import { TugOfWar } from "@/components/game/scoreboard";
import { DownloadIcon } from "@/components/ui/icons";

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-[60px] cursor-pointer items-center justify-between gap-4 rounded-2xl bg-paper px-4 py-3 ring-1 ring-gold/30">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden className="relative h-8 w-14 shrink-0 rounded-full bg-ink/20 transition peer-checked:bg-leaf peer-focus-visible:ring-2 peer-focus-visible:ring-turmeric after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-6" />
    </label>
  );
}

export function RsvpTab() {
  const { data } = useLive<Rsvp[]>(["rsvps"], (s) => s.listRsvps(), []);
  const [attending, setAttending] = useState<"all" | "yes" | "no">("all");
  const [side, setSide] = useState<"all" | Rsvp["side"]>("all");
  const rows = data.filter((r) => (attending === "all" || r.attending === (attending === "yes")) && (side === "all" || r.side === side));
  const totals = useMemo(() => {
    const yes = data.filter((r) => r.attending);
    const meals = yes.reduce<Record<string, number>>((m, r) => ({ ...m, [r.meal]: (m[r.meal] ?? 0) + r.guestCount }), {});
    return { people: yes.reduce((n, r) => n + r.guestCount, 0), yes: yes.length, no: data.length - yes.length, meals };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="card p-3"><p className="font-serif text-3xl text-maroon">{totals.people}</p><p className="text-xs text-muted">people coming</p></div>
        <div className="card p-3"><p className="font-serif text-3xl text-leaf">{totals.yes}</p><p className="text-xs text-muted">said yes</p></div>
        <div className="card p-3"><p className="font-serif text-3xl text-muted">{totals.no}</p><p className="text-xs text-muted">can&rsquo;t make it</p></div>
      </div>
      <p className="text-sm text-muted">Meals: {Object.entries(totals.meals).map(([k, v]) => `${k} ${v}`).join(" · ") || "none yet"}</p>
      <div className="flex flex-wrap gap-2">
        <select className="input w-auto" value={attending} onChange={(e) => setAttending(e.target.value as typeof attending)} aria-label="Filter by attending">
          <option value="all">Everyone</option>
          <option value="yes">Attending</option>
          <option value="no">Not attending</option>
        </select>
        <select className="input w-auto" value={side} onChange={(e) => setSide(e.target.value as typeof side)} aria-label="Filter by side">
          <option value="all">Both sides</option>
          <option value="bride">Bride&rsquo;s side</option>
          <option value="groom">Groom&rsquo;s side</option>
          <option value="both">Friends / both</option>
        </select>
        <button className="btn-primary ml-auto" onClick={() => downloadFile("rsvps.csv", toCsv(rows.map((r) => ({ ...r, createdAt: formatDate(r.createdAt) }))), "text/csv")}>
          <DownloadIcon size={18} /> Download CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl ring-1 ring-gold/30">
        <table className="w-full min-w-[640px] bg-paper text-left text-sm">
          <thead className="bg-gold/15 text-xs uppercase tracking-wide text-maroon">
            <tr>
              <th className="p-3">Name</th><th className="p-3">Coming</th><th className="p-3">Guests</th><th className="p-3">Side</th><th className="p-3">Meal</th><th className="p-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gold/20 align-top">
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3">{r.attending ? "✅ Yes" : "No"}</td>
                <td className="p-3">{r.guestCount}</td>
                <td className="p-3 capitalize">{r.side}</td>
                <td className="p-3">{r.meal}</td>
                <td className="p-3 text-muted">{r.note}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6} className="p-6 text-center text-muted">No RSVPs match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GameTab() {
  const toast = useUi((s) => s.showToast);
  const settings = useSettings((s) => s.settings);
  const totals = useTeamTotals().data;
  const { data } = useLive<{ predictions: Prediction[]; votes: PredictionVote[] }>(["predictions", "votes"], async (s) => ({ predictions: await s.listPredictions(), votes: await s.listVotes() }), { predictions: [], votes: [] });
  const leader: Team | null = totals.bride === totals.groom ? null : totals.bride > totals.groom ? "bride" : "groom";

  const end = async (winner: Team | null) => {
    if (!confirm(`End the game and announce ${winner ? `Team ${winner === "bride" ? "Bride" : "Groom"}` : "a tie"} as the winner? It will show on the live screen.`)) return;
    await getStore().endGame(winner);
    toast("Winner announced! 🎉");
  };

  return (
    <div className="space-y-6">
      <div className="card p-5 pt-8">
        <TugOfWar totals={totals} />
      </div>

      <section>
        <h3 className="mb-2 font-serif text-xl text-maroon">Reveal predictions</h3>
        <p className="mb-3 text-sm text-muted">When you know the answer, tap it. Guests who guessed right get 15 points.</p>
        <div className="space-y-3">
          {data.predictions.map((p) => (
            <div key={p.id} className="card p-4">
              <p className="font-semibold">{p.question}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {p.options.map((o, i) => {
                  const votes = data.votes.filter((v) => v.predictionId === p.id && v.option === i).length;
                  const revealed = p.revealedAnswer === i;
                  return (
                    <button
                      key={i}
                      disabled={p.revealedAnswer !== null}
                      onClick={async () => {
                        if (!confirm(`Reveal "${o}" as the answer?`)) return;
                        await getStore().revealPrediction(p.id, i);
                        toast("Answer revealed");
                      }}
                      className={`btn justify-between ${revealed ? "bg-leaf text-jasmine" : "bg-paper ring-1 ring-gold/40"} disabled:opacity-100`}
                    >
                      <span>{o}</span>
                      <span className="text-xs opacity-70">{votes} votes</span>
                    </button>
                  );
                })}
              </div>
              {p.revealedAnswer !== null && (
                <button className="mt-2 text-xs text-muted underline" onClick={() => getStore().revealPrediction(p.id, null)}>
                  Undo reveal (points already given stay)
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="font-serif text-xl text-maroon">End the game</h3>
        {settings.gameStatus === "ended" ? (
          <>
            <p>The game has ended. Winner: <strong>{settings.winner ? `Team ${settings.winner === "bride" ? "Bride" : "Groom"}` : "a tie"}</strong>.</p>
            <button className="btn-ghost" onClick={() => getStore().updateSettings({ gameStatus: "open", winner: null })}>Re-open the game</button>
          </>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            <button className="btn-primary min-h-[56px]" onClick={() => end(leader)}>
              Announce current leader {leader ? `(Team ${leader === "bride" ? "Bride" : "Groom"})` : "(tie)"}
            </button>
            <button className="btn min-h-[56px] bg-bride text-jasmine" onClick={() => end("bride")}>Team Bride wins</button>
            <button className="btn min-h-[56px] bg-groom text-jasmine" onClick={() => end("groom")}>Team Groom wins</button>
          </div>
        )}
      </section>

      <section className="card space-y-2 border-l-4 border-maroon p-5">
        <h3 className="font-serif text-xl text-maroon">Reset scores</h3>
        <p className="text-sm text-muted">Clears every point, vote and revealed answer. Use after a rehearsal.</p>
        <button
          className="btn-ghost"
          onClick={async () => {
            if (!confirm("Reset ALL scores and votes? This cannot be undone.")) return;
            await getStore().resetScores();
            toast("Scores reset");
          }}
        >
          Reset all scores
        </button>
      </section>
    </div>
  );
}

const moduleLabels: Record<ModuleKey, string> = {
  story: "Our story timeline",
  chat: "How we met chat",
  families: "Meet the families",
  events: "Events & schedule",
  rituals: "Ritual guide",
  venue: "Venue guide",
  rsvp: "RSVP form",
  gallery: "Photo gallery",
  upload: "Photo uploads",
  blessings: "Blessings wall",
  play: "Bride vs Groom game",
  live: "Live screen",
  films: "Films",
  capsule: "Time capsule",
};

export function ContentTab() {
  const settings = useSettings((s) => s.settings);
  const phase = usePhase();
  const { phaseOverride, setPhaseOverride } = useUi();
  const update = (patch: Parameters<ReturnType<typeof getStore>["updateSettings"]>[0]) => getStore().updateSettings(patch);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 font-serif text-xl text-maroon">Which stage is the wedding in?</h3>
        <p className="mb-3 text-sm text-muted">Automatic switches by date. Currently showing: <strong>{phase}</strong>{phaseOverride ? " (preview on this device)" : ""}.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["auto", "before", "during", "after"] as Array<Phase | "auto">).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPhaseOverride(null);
                void update({ phase: p });
              }}
              className={`btn min-h-[56px] ${settings.phase === p && !phaseOverride ? "bg-maroon text-jasmine" : "bg-paper ring-1 ring-gold/40"}`}
            >
              {p === "auto" ? "Automatic" : p === "before" ? "Before (invite)" : p === "during" ? "Wedding day" : "After (thank you)"}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-serif text-xl text-maroon">Look & feel</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(weddingConfig.themes) as ThemeName[]).map((name) => (
            <button key={name} onClick={() => update({ theme: name })} className={`btn min-h-[64px] capitalize ${settings.theme === name ? "ring-2 ring-maroon" : "ring-1 ring-gold/40"}`} style={{ background: `rgb(${weddingConfig.themes[name].bg})`, color: `rgb(${weddingConfig.themes[name].maroon})` }}>
              <span className="h-6 w-6 rounded-full" style={{ background: `rgb(${weddingConfig.themes[name].gold})` }} aria-hidden />
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="mb-2 font-serif text-xl text-maroon">Approvals</h3>
        <Toggle label="Approve new photos and blessings automatically" hint="When off, a family member approves each one before guests see it." checked={settings.autoApprove} onChange={(v) => update({ autoApprove: v })} />
      </section>

      <section className="space-y-2">
        <h3 className="mb-2 font-serif text-xl text-maroon">Sections on the site</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(moduleLabels) as ModuleKey[]).map((k) => (
            <Toggle key={k} label={moduleLabels[k]} checked={settings.modulesEnabled[k] !== false} onChange={(v) => update({ modulesEnabled: { ...settings.modulesEnabled, [k]: v } })} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function DownloadsTab() {
  const photos = useLive<Photo[]>(["photos"], (s) => s.listPhotos({ status: "approved" }), []);
  const blessings = useLive<Blessing[]>(["blessings"], (s) => s.listBlessings({ status: "approved" }), []);
  const capsule = useLive<CapsuleMessage[]>(["capsule"], (s) => s.listCapsule(), []);
  const [showCapsule, setShowCapsule] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const photoRows = photos.data.map((p) => ({ id: p.id, url: p.url.startsWith("data:") ? "(stored in this browser)" : p.url.startsWith("/") ? origin + p.url : p.url, uploader: p.uploaderName, caption: p.caption, team: p.team ?? "", likes: p.likes, source: p.source, date: p.createdAt }));
  const blessingRows = blessings.data.map((b) => ({ name: b.name, relation: b.relation, message: b.message, date: b.createdAt }));

  const Card = ({ title, count, csv, json, name }: { title: string; count: number; csv: string; json: unknown; name: string }) => (
    <div className="card p-5">
      <p className="font-serif text-xl text-maroon">{title}</p>
      <p className="text-sm text-muted">{count} approved</p>
      <div className="mt-3 flex gap-2">
        <button className="btn-primary flex-1" onClick={() => downloadFile(`${name}.csv`, csv, "text/csv")}><DownloadIcon size={18} /> CSV</button>
        <button className="btn-ghost flex-1" onClick={() => downloadFile(`${name}.json`, JSON.stringify(json, null, 2), "application/json")}><DownloadIcon size={18} /> JSON</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Photos" count={photos.data.length} csv={toCsv(photoRows)} json={photoRows} name="photos" />
        <Card title="Blessings" count={blessings.data.length} csv={toCsv(blessingRows)} json={blessingRows} name="blessings" />
      </div>
      {isSupabaseConfigured && <p className="text-sm text-muted">Full-resolution photos are in the Supabase storage bucket &ldquo;photos&rdquo;.</p>}

      <section className="card p-5">
        <h3 className="font-serif text-xl text-maroon">Time capsule (for the couple)</h3>
        <p className="text-sm text-muted">
          {capsule.data.length} sealed messages. Guests cannot see these. Please keep them closed until {formatDate(weddingConfig.firstAnniversary)}.
        </p>
        <button className="btn-ghost mt-3" onClick={() => setShowCapsule(!showCapsule)}>
          {showCapsule ? "Close the capsule" : "Open the capsule (couple only)"}
        </button>
        {showCapsule && (
          <ul className="mt-4 space-y-2">
            {capsule.data.map((c) => (
              <li key={c.id} className="rounded-xl bg-gold/10 p-3 text-sm">
                <p className="whitespace-pre-line">{c.message}</p>
                <p className="mt-1 text-xs font-semibold text-maroon">{c.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
