"use client";

import { weddingConfig, type WeddingEvent } from "@/config/wedding.config";
import { buildIcs, downloadFile } from "@/lib/calendar";
import { formatDate, formatTime } from "@/lib/text";
import { useLoc, useT } from "@/state/ui";
import { Reveal, Section, SectionHeader } from "@/components/ui/primitives";
import { CalendarIcon, ClockIcon, MapIcon } from "@/components/ui/icons";
import { useNow } from "@/components/home/hero";

/** Build a Google Calendar add-event URL for a single event. */
function googleCalUrl(e: WeddingEvent, title: string, description: string): string {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(e.start)}/${fmt(e.end)}`,
    details: description,
    location: `${e.venue}, ${e.address}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function Events() {
  const t = useT();
  const loc = useLoc();
  const now = useNow(60_000);

  const addToCalendar = (events: WeddingEvent[], name: string) => {
    const ics = buildIcs(events.map((e) => ({ ...e, title: loc(e.name), description: `${loc(e.description)}\nDress: ${loc(e.dressHint)}` })));
    downloadFile(name, ics, "text/calendar;charset=utf-8");
  };

  return (
    <Section id="events">
      <div className="container-narrow">
        <SectionHeader title={t("events.title")} />
        <ol className="space-y-4">
          {weddingConfig.events.map((e, i) => {
            const past = now ? new Date(e.end) < now : false;
            const live = now ? new Date(e.start) <= now && now <= new Date(e.end) : false;
            return (
              <li key={e.id}>
                <Reveal delay={i * 0.05}>
                  <article className={`card relative overflow-hidden p-5 ${past ? "opacity-70" : ""}`}>
                    {live && <span className="absolute right-4 top-4 rounded-full bg-maroon px-3 py-1 text-xs font-semibold text-jasmine">{t("during.live")}</span>}
                    <div className="flex gap-4">
                      {/* Date badge */}
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-xl py-2 text-maroon" style={{ background: "rgba(193,158,96,0.1)", border: "1px solid rgba(193,158,96,0.25)" }}>
                        <span className="text-[10px] uppercase tracking-[0.15em]">{formatDate(e.start, { month: "short" })}</span>
                        <span className="font-serif leading-none" style={{ fontSize: "clamp(1.6rem,5vw,2rem)" }}>{formatDate(e.start, { day: "numeric" })}</span>
                        <span className="text-[9px] text-muted">{formatDate(e.start, { weekday: "short" })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-maroon" style={{ fontSize: "clamp(1.2rem,4vw,1.5rem)", lineHeight: 1.1 }}>{loc(e.name)}</h3>
                        <p className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="pill"><ClockIcon size={12} />{formatTime(e.start)} – {formatTime(e.end)}</span>
                          <span className="pill"><MapIcon size={12} />{e.venue.split("–")[0].trim()}</span>
                        </p>
                        <p className="mt-3 text-sm leading-relaxed">{loc(e.description)}</p>
                        <p className="mt-2 rounded-lg bg-turmeric/10 px-3 py-2 text-sm">
                          <span className="font-semibold text-maroon">{t("events.dress")}:</span> {loc(e.dressHint)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            className="btn-ghost btn-sm"
                            href={googleCalUrl(e, loc(e.name), `${loc(e.description)}\nDress: ${loc(e.dressHint)}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <CalendarIcon size={15} /> Add to Calendar
                          </a>
                          <a className="btn-ghost btn-sm" href={e.mapUrl} target="_blank" rel="noopener noreferrer">
                            <MapIcon size={15} /> {t("events.maps")}
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 text-center">
          <button className="btn-primary" onClick={() => addToCalendar(weddingConfig.events, "karthik-anjali-wedding.ics")}>
            <CalendarIcon size={18} /> Download all events (.ics)
          </button>
        </div>
      </div>
    </Section>
  );
}
