"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { weddingConfig, type ModuleKey } from "@/config/wedding.config";
import { useSettings } from "@/data/hooks";
import { formatDate } from "@/lib/text";
import { usePhase, useLoc, useT } from "@/state/ui";
import type { StringKey } from "@/lib/i18n";
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
      <div className={`flex justify-center ${large ? "gap-10" : "gap-3 sm:gap-5"}`}>
        {parts.map(([n, key]) => (
          <div key={key} className={`flex flex-col items-center rounded-2xl bg-paper/80 ring-1 ring-gold/30 ${large ? "min-w-[180px] px-6 py-6" : "min-w-[68px] px-2 py-3"}`}>
            <span className={`font-serif tabular-nums text-maroon ${large ? "text-8xl" : "text-3xl sm:text-4xl"}`}>{String(n).padStart(2, "0")}</span>
            <span className={`uppercase tracking-widest text-muted ${large ? "text-xl" : "text-[10px]"}`}>{t(key)}</span>
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
    <section className="relative overflow-hidden pb-10 pt-6 sm:pt-12">
      <div aria-hidden className="motif pointer-events-none absolute inset-0" />
      <div className="container-narrow relative flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex w-full items-end justify-center gap-4 pt-10">
          <div>
            <p className="eyebrow">{phase === "after" ? t("hero.married") : phase === "during" ? t("during.live") : t("intro.invite")}</p>
            <h1 className="mt-3 font-serif text-[3.2rem] leading-[1.02] text-maroon sm:text-7xl">
              {weddingConfig.groom.name}
              <span className="mx-3 inline-block font-serif text-4xl italic text-gold sm:text-5xl">&amp;</span>
              {weddingConfig.bride.name}
            </h1>
          </div>
        </motion.div>
        <p className="mt-4 max-w-md font-serif text-xl italic text-ink/80">{loc(weddingConfig.tagline)}</p>
        <div className="kasavu-line my-6 w-32" />
        <p className="font-medium text-ink">{formatDate(weddingConfig.muhurtham.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        <p className="text-sm text-muted">
          {weddingConfig.venue.name} · {weddingConfig.venue.address.split(",").slice(1, 3).join(",").trim()}
        </p>
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
