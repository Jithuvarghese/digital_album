"use client";

import Link from "next/link";
import { weddingConfig } from "@/config/wedding.config";
import { useLive } from "@/data/hooks";
import type { Photo } from "@/data/types";
import { formatDate, formatTime } from "@/lib/text";
import { useLoc, useT } from "@/state/ui";
import { Reveal, Section, Skeleton } from "@/components/ui/primitives";
import { LiveScoreboard } from "@/components/game/scoreboard";
import { CameraIcon, CapsuleIcon, FilmIcon, PrintIcon, TvIcon } from "@/components/ui/icons";
import { Jasmine } from "@/components/ui/ornaments";
import { useNow } from "./hero";

export function currentAndNextEvent(now: Date) {
  const events = weddingConfig.events;
  const current = events.find((e) => new Date(e.start) <= now && now <= new Date(e.end)) ?? null;
  const next = events.find((e) => new Date(e.start) > now) ?? null;
  return { current, next };
}

export function NowHappening() {
  const t = useT();
  const loc = useLoc();
  const now = useNow(30_000);
  const { current, next } = now ? currentAndNextEvent(now) : { current: null, next: null };
  return (
    <Section className="pt-6">
      <div className="container-narrow space-y-4">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="flex items-center gap-4 bg-maroon p-5 text-jasmine">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">{current ? t("during.live") : "Up next"}</p>
                <p className="font-serif text-2xl">{current ? loc(current.name) : next ? loc(next.name) : "Celebrations continue"}</p>
                {(current ?? next) && (
                  <p className="text-sm text-jasmine/80">
                    {formatDate((current ?? next)!.start, { weekday: "short", day: "numeric", month: "short" })} · {formatTime((current ?? next)!.start)} · {(current ?? next)!.venue}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-gold/20">
              <Link href="/upload" className="flex min-h-[64px] items-center justify-center gap-2 bg-paper font-semibold text-maroon hover:bg-gold/10">
                <CameraIcon /> {t("qa.upload")}
              </Link>
              <Link href="/live" className="flex min-h-[64px] items-center justify-center gap-2 bg-paper font-semibold text-maroon hover:bg-gold/10">
                <TvIcon /> {t("qa.live")}
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Link href="/play" className="card block p-5 pt-8 transition hover:-translate-y-0.5">
            <LiveScoreboard />
            <p className="mt-6 text-center text-sm font-semibold text-maroon">Join a team and play →</p>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}

export function PhotoStrip({ title, sort }: { title: string; sort: "likes" | "recent" }) {
  const { data, loading } = useLive<Photo[]>(["photos"], (s) => s.listPhotos({ status: "approved" }), []);
  const photos = [...data]
    .filter((p) => (sort === "recent" ? p.source === "guest" : true))
    .sort((a, b) => (sort === "likes" ? b.likes - a.likes : b.createdAt.localeCompare(a.createdAt)))
    .slice(0, 10);
  return (
    <Section className="py-10">
      <div className="container-wide">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-maroon sm:text-3xl">{title}</h2>
          <Link href="/gallery" className="text-sm font-semibold text-maroon underline-offset-4 hover:underline">
            See all
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 w-40 shrink-0" />)
            : photos.map((p) => (
                <li key={p.id} className="w-40 shrink-0 snap-start sm:w-52">
                  <Link href={`/gallery?photo=${p.id}`} className="block overflow-hidden rounded-2xl shadow-card ring-1 ring-gold/20">
                    <img src={p.thumbUrl} alt={p.caption || `Photo by ${p.uploaderName}`} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                  </Link>
                  <p className="mt-1.5 truncate text-xs text-muted">
                    {sort === "likes" ? `♥ ${p.likes} · ` : ""}
                    {p.uploaderName}
                  </p>
                </li>
              ))}
        </ul>
      </div>
    </Section>
  );
}

export function ThankYou() {
  const t = useT();
  const loc = useLoc();
  return (
    <Section className="pt-4">
      <div className="container-narrow">
        <Reveal>
          <div className="card kasavu-frame relative overflow-hidden p-8 text-center sm:p-12">
            <div className="mb-4 flex justify-center gap-1" aria-hidden>
              <Jasmine /> <Jasmine size={26} /> <Jasmine />
            </div>
            <h2 className="section-title">{t("after.thanks")}</h2>
            <p className="mx-auto mt-4 max-w-lg font-serif text-xl italic leading-relaxed text-ink/85">{loc(weddingConfig.thankYou)}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/memory-book" className="btn-primary">
                <PrintIcon size={18} /> {t("after.memory")}
              </Link>
              <Link href="/films" className="btn-ghost">
                <FilmIcon size={18} /> {t("qa.films")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export function CapsuleTeaser() {
  const t = useT();
  return (
    <Section className="py-8">
      <div className="container-narrow">
        <Link href="/capsule" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/20 text-maroon">
            <CapsuleIcon size={28} />
          </span>
          <div>
            <p className="font-serif text-xl text-maroon">{t("capsule.title")}</p>
            <p className="text-sm text-muted">
              {t("capsule.subtitle")} {t("capsule.opens")} {formatDate(weddingConfig.firstAnniversary)}.
            </p>
          </div>
        </Link>
      </div>
    </Section>
  );
}
