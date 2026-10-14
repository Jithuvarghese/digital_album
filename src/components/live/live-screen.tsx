"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useLive, useSettings, useTeamTotals } from "@/data/hooks";
import type { Blessing, Guest, Photo } from "@/data/types";
import { keepAwake, toggleFullscreen } from "@/lib/wakelock";
import { formatTime } from "@/lib/text";
import { useLoc } from "@/state/ui";
import { BlessingCard } from "@/components/blessings/blessing-card";
import { TugOfWar } from "@/components/game/scoreboard";
import { Celebration, Leaderboard } from "@/components/game/gifts-leaderboard";
import { Countdown, useNow } from "@/components/home/hero";
import { currentAndNextEvent } from "@/components/home/phase-blocks";
import { QrCode, useSiteUrl } from "@/components/ui/qr-code";

export type Scene = "countdown" | "photos" | "blessings" | "scores" | "winner";
const ALL_SCENES: Scene[] = ["countdown", "photos", "blessings", "scores"];
const DURATION: Record<Scene, number> = { countdown: 12_000, photos: 30_000, blessings: 24_000, scores: 14_000, winner: 20_000 };

/** Renders children on a fixed 1920x1080 stage scaled to fit any screen. */
function Stage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#140c0a]">
      <div className="relative shrink-0 overflow-hidden bg-ivory text-ink" style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

function CountdownScene() {
  const loc = useLoc();
  const now = useNow(10_000);
  const { current, next } = now ? currentAndNextEvent(now) : { current: null, next: null };
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex items-end gap-16">
        <div>
          <p className="text-3xl uppercase tracking-[0.4em] text-gold">{current ? "Now happening" : "Welcome to the wedding of"}</p>
          <h1 className="mt-6 font-serif text-[10rem] leading-none text-maroon">
            {current ? loc(current.name) : `${weddingConfig.groom.name} & ${weddingConfig.bride.name}`}
          </h1>
        </div>
      </div>
      <div className="kasavu-line my-12 w-[600px]" />
      {current ? (
        <p className="font-serif text-5xl italic text-ink/80">{loc(current.description)}</p>
      ) : (
        <Countdown large />
      )}
      {next && !current && <p className="mt-10 text-3xl text-muted">Next: {loc(next.name)} at {formatTime(next.start)}</p>}
    </div>
  );
}

function PhotoScene({ photos, highlight }: { photos: Photo[]; highlight: Photo | null }) {
  const [i, setI] = useState(0);
  const list = highlight ? [highlight] : photos;
  useEffect(() => {
    setI(0);
    if (list.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length]);
  const p = list[i % Math.max(1, list.length)];
  if (!p) return <div className="flex h-full items-center justify-center font-serif text-6xl text-maroon">Share your photos, they will appear here!</div>;
  const isNew = highlight?.id === p.id || Date.now() - new Date(p.createdAt).getTime() < 10 * 60_000;
  return (
    <div className="relative h-full bg-[#1b1210]">
      <AnimatePresence mode="sync">
        <motion.div key={p.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
          <img src={p.url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
          <motion.img
            src={p.url}
            alt={p.caption || "Guest photo"}
            className="absolute inset-0 m-auto max-h-[92%] max-w-[80%] rounded-2xl object-contain shadow-2xl"
            initial={{ scale: 1 }}
            animate={{ scale: 1.06 }}
            transition={{ duration: 6, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-10 left-10 max-w-[1100px] rounded-2xl bg-black/50 px-8 py-5 text-jasmine backdrop-blur">
        {isNew && p.source === "guest" && <p className="mb-1 text-xl font-semibold uppercase tracking-widest text-turmeric">✨ Just shared</p>}
        {p.caption && <p className="font-serif text-5xl">{p.caption}</p>}
        <p className="mt-1 text-2xl text-jasmine/80">
          {p.source === "couple" ? "From the couple" : `by ${p.uploaderName}`}
          {p.team && ` · Team ${p.team === "bride" ? "Bride" : "Groom"}`}
        </p>
      </div>
    </div>
  );
}

function BlessingScene({ blessings }: { blessings: Blessing[] }) {
  const list = blessings.slice(0, 12);
  const doubled = useMemo(() => [...list, ...list], [list]);
  return (
    <div className="flex h-full gap-16 px-24 py-16">
      <div className="flex w-[520px] shrink-0 flex-col justify-center">
        <p className="text-3xl uppercase tracking-[0.35em] text-gold">Blessings</p>
        <h2 className="mt-4 font-serif text-8xl leading-tight text-maroon">Words of love</h2>
        <p className="mt-6 text-3xl text-muted">{blessings.length} blessings and counting. Scan the code to add yours.</p>
      </div>
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee-up columns-2 gap-8">
          {doubled.map((b, i) => (
            <div key={`${b.id}-${i}`} className="mb-8 break-inside-avoid text-[1.6rem]">
              <BlessingCard b={b} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreScene({ guests }: { guests: Guest[] }) {
  const { data } = useTeamTotals();
  return (
    <div className="flex h-full flex-col px-32 py-20">
      <p className="text-center text-3xl uppercase tracking-[0.4em] text-gold">Bride vs Groom</p>
      <h2 className="text-center font-serif text-8xl text-maroon">Live scoreboard</h2>
      <div className="mt-28">
        <TugOfWar totals={data} large />
      </div>
      <div className="mt-16 grid grid-cols-2 gap-10">
        <Leaderboard guests={guests} limit={4} large />
        <Leaderboard guests={guests} offset={4} limit={4} large />
      </div>
    </div>
  );
}

export function LiveScreen() {
  const params = useSearchParams();
  const url = useSiteUrl("/");
  const settings = useSettings((s) => s.settings);
  const { data: photos } = useLive<Photo[]>(["photos"], (s) => s.listPhotos({ status: "approved" }), []);
  const { data: blessings } = useLive<Blessing[]>(["blessings"], (s) => s.listBlessings({ status: "approved" }), []);
  const { data: guests } = useLive<Guest[]>(["guests", "scores"], (s) => s.listGuests(), []);

  const scenes = useMemo<Scene[]>(() => {
    const requested = (params.get("scenes") ?? "").split(",").map((s) => s.trim()).filter((s): s is Scene => [...ALL_SCENES, "winner"].includes(s));
    const base = requested.length ? requested : ALL_SCENES;
    return settings.gameStatus === "ended" && !base.includes("winner") ? ["winner", ...base] : base;
  }, [params, settings.gameStatus]);

  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<Photo | null>(null);
  const seen = useRef<Set<string> | null>(null);
  const scene = highlight ? "photos" : scenes[index % scenes.length];

  // Rotate scenes
  useEffect(() => {
    if (highlight) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % scenes.length), DURATION[scene]);
    return () => clearTimeout(id);
  }, [index, scene, scenes.length, highlight]);

  // Spotlight newly approved guest photos as they arrive
  useEffect(() => {
    if (!photos.length) return;
    if (!seen.current) {
      seen.current = new Set(photos.map((p) => p.id));
      return;
    }
    const fresh = photos.find((p) => !seen.current!.has(p.id) && p.source === "guest");
    photos.forEach((p) => seen.current!.add(p.id));
    if (fresh) {
      setHighlight(fresh);
      const id = setTimeout(() => setHighlight(null), 8000);
      return () => clearTimeout(id);
    }
  }, [photos]);

  // Venue display niceties
  useEffect(() => {
    const release = keepAwake();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "ArrowRight") setIndex((i) => i + 1);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + scenes.length) % scenes.length);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.cursor = "none";
    return () => {
      release();
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.cursor = "";
    };
  }, [scenes.length]);

  return (
    <Stage>
      <AnimatePresence mode="wait">
        <motion.div
          key={scene + (highlight?.id ?? "")}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {scene === "countdown" && <CountdownScene />}
          {scene === "photos" && <PhotoScene photos={photos.slice(0, 30)} highlight={highlight} />}
          {scene === "blessings" && <BlessingScene blessings={blessings} />}
          {scene === "scores" && <ScoreScene guests={guests} />}
          {scene === "winner" && (
            <div className="h-full p-10">
              <Celebration winner={settings.winner} large />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-5 rounded-3xl bg-paper/95 p-4 pr-7 shadow-2xl ring-1 ring-gold/40">
        <QrCode value={url} className="h-40 w-40" label="Scan to join" />
        <div>
          <p className="font-serif text-4xl text-maroon">Scan to join</p>
          <p className="mt-1 text-xl text-muted">Share photos · Bless · Play</p>
          <p className="mt-2 text-lg font-semibold text-gold">{weddingConfig.hashtag}</p>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-hidden>
        {scenes.map((s, i) => (
          <span key={s} className={`h-2 rounded-full transition-all ${i === index % scenes.length && !highlight ? "w-10 bg-maroon" : "w-2 bg-gold/60"}`} />
        ))}
      </div>
    </Stage>
  );
}
