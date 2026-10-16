"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { weddingConfig, type ModuleKey } from "@/config/wedding.config";
import { useSettings } from "@/data/hooks";
import { formatDate } from "@/lib/text";
import { usePhase, useLoc, useT } from "@/state/ui";
import type { StringKey } from "@/lib/i18n";
import { Jasmine } from "@/components/ui/ornaments";
import { BlessIcon, CalendarIcon, CameraIcon, CapsuleIcon, FilmIcon, MapIcon, TrophyIcon, TvIcon, HeartIcon } from "@/components/ui/icons";

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function Countdown({ large = false }: { large?: boolean }) {
  const t = useT();
  const now = useNow();
  const start = new Date(weddingConfig.muhurtham.start);
  const dayEnd = new Date(weddingConfig.date + "T23:59:59+05:30");

  if (!now) return <div className={large ? "h-40" : "h-24"} aria-hidden />;

  if (now >= start) {
    const label = now <= dayEnd ? t("hero.today") : t("hero.married");
    return <p className={`font-serif italic text-maroon ${large ? "text-8xl" : "text-4xl"}`}>{label}</p>;
  }
  const diff = start.getTime() - now.getTime();
  const parts: Array<[number, StringKey]> = [
    [Math.floor(diff / 86_400_000), "hero.days"],
    [Math.floor((diff / 3_600_000) % 24), "hero.hours"],
    [Math.floor((diff / 60_000) % 60), "hero.minutes"],
    [Math.floor((diff / 1000) % 60), "hero.seconds"],
  ];
  return (
    <div role="timer" aria-label={t("hero.countdown")}>
      <div className={`flex justify-center ${large ? "gap-10" : "gap-1.5 sm:gap-4"}`}>
        {parts.map(([n, key]) => (
          <div key={key} className={`flex flex-col items-center rounded-2xl bg-paper/80 ring-1 ring-gold/30 ${large ? "min-w-[180px] px-6 py-6" : "w-[62px] px-1.5 py-3 sm:w-[76px]"}`}>
            <span className={`font-serif tabular-nums text-maroon ${large ? "text-8xl" : "text-3xl sm:text-4xl"}`}>{String(n).padStart(2, "0")}</span>
            <span className={`uppercase tracking-widest text-muted ${large ? "text-xl" : "text-[9px] sm:text-[10px]"}`}>{t(key)}</span>
          </div>
        ))}
      </div>
      <p className={`mt-3 text-center text-muted ${large ? "text-2xl" : "text-xs"}`}>{t("hero.countdown")} · {weddingConfig.muhurtham.label}</p>
    </div>
  );
}

export function Hero() {
  const loc = useLoc();
  const phase = usePhase();
  const t = useT();
  return (
    <section className="relative overflow-hidden pb-10 pt-8 sm:pt-14">
      <div className="container-narrow relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl px-6 pb-10 pt-16 sm:px-12 sm:pt-20"
        >
          {/* Temple-arch frame */}
          <svg aria-hidden viewBox="0 0 400 520" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="arch-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgb(var(--c-paper))" stopOpacity="0.95" />
                <stop offset="1" stopColor="rgb(var(--c-paper))" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <path d="M8 518 V170 Q8 8 200 8 Q392 8 392 170 V518" fill="url(#arch-fill)" stroke="rgb(var(--c-gold) / 0.7)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path d="M20 518 V174 Q20 22 200 22 Q380 22 380 174 V518" fill="none" stroke="rgb(var(--c-gold) / 0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="relative">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Jasmine size={22} className="mx-auto" />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="eyebrow mt-4">
              {phase === "after" ? t("hero.married") : phase === "during" ? t("during.live") : t("intro.invite")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-4 font-serif font-semibold leading-[0.95] tracking-tight text-maroon"
            >
              <span className="block text-[3.4rem] sm:text-7xl">{weddingConfig.groom.name}</span>
              <span className="my-1 block font-serif text-3xl font-medium italic text-gold sm:text-4xl">&amp;</span>
              <span className="block text-[3.4rem] sm:text-7xl">{weddingConfig.bride.name}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="mx-auto mt-5 max-w-sm font-serif text-xl italic leading-snug text-ink/75">
              {loc(weddingConfig.tagline)}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="mx-auto mt-7 flex max-w-xs items-center justify-center gap-4 border-y border-gold/40 py-3 font-serif text-maroon"
            >
              <span className="text-sm uppercase tracking-[0.2em]">{formatDate(weddingConfig.muhurtham.start, { weekday: "long" })}</span>
              <span className="text-3xl font-semibold leading-none">{formatDate(weddingConfig.muhurtham.start, { day: "numeric" })}</span>
              <span className="text-sm uppercase tracking-[0.2em]">
                {formatDate(weddingConfig.muhurtham.start, { month: "short" })} {formatDate(weddingConfig.muhurtham.start, { year: "numeric" })}
              </span>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="mt-3 text-sm text-muted">
              {weddingConfig.venue.name} · {weddingConfig.venue.address.split(",").slice(1, 3).join(",").trim()}
            </motion.p>
          </div>
        </motion.div>
        {phase !== "after" && (
          <div className="mt-8 w-full">
            <Countdown />
          </div>
        )}
      </div>
    </section>
  );
}

type Action = { href: string; key: StringKey; icon: typeof CameraIcon; module?: ModuleKey; external?: boolean };

export function QuickActions() {
  const t = useT();
  const phase = usePhase();
  const modules = useSettings((s) => s.settings.modulesEnabled);
  const byPhase: Record<typeof phase, Action[]> = {
    before: [
      { href: "#rsvp", key: "qa.rsvp", icon: HeartIcon, module: "rsvp" },
      { href: "#events", key: "qa.schedule", icon: CalendarIcon, module: "events" },
      { href: weddingConfig.venue.mapUrl, key: "qa.directions", icon: MapIcon, external: true },
      { href: "/blessings", key: "qa.bless", icon: BlessIcon, module: "blessings" },
      { href: "/play", key: "qa.play", icon: TrophyIcon, module: "play" },
    ],
    during: [
      { href: "/upload", key: "qa.upload", icon: CameraIcon, module: "upload" },
      { href: "/blessings", key: "qa.bless", icon: BlessIcon, module: "blessings" },
      { href: "/play", key: "qa.play", icon: TrophyIcon, module: "play" },
      { href: "#events", key: "qa.schedule", icon: CalendarIcon, module: "events" },
      { href: weddingConfig.venue.mapUrl, key: "qa.directions", icon: MapIcon, external: true },
      { href: "/live", key: "qa.live", icon: TvIcon, module: "live" },
    ],
    after: [
      { href: "/films", key: "qa.films", icon: FilmIcon, module: "films" },
      { href: "/gallery", key: "nav.gallery", icon: CameraIcon, module: "gallery" },
      { href: "/blessings", key: "qa.bless", icon: BlessIcon, module: "blessings" },
      { href: "/capsule", key: "qa.capsule", icon: CapsuleIcon, module: "capsule" },
    ],
  };
  const actions = byPhase[phase].filter((a) => !a.module || modules[a.module] !== false);
  return (
    <nav aria-label="Quick actions" className="container-wide">
      <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 pt-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {actions.map((a) => {
          const inner = (
            <>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-maroon/10 to-gold/20 text-maroon transition group-hover:from-maroon group-hover:to-maroon group-hover:text-jasmine">
                <a.icon />
              </span>
              <span className="flex h-8 items-center text-[12px] font-semibold leading-tight text-ink">{t(a.key)}</span>
            </>
          );
          const cls = "card group flex h-[112px] w-[104px] snap-start flex-col items-center justify-center gap-2 px-2 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg";
          return (
            <li key={a.key} className="shrink-0">
              {a.external ? (
                <a href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link href={a.href.startsWith("#") ? `/${a.href}` : a.href} className={cls}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
