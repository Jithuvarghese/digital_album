"use client";

import { weddingConfig } from "@/config/wedding.config";
import { useT } from "@/state/ui";
import { Reveal, Section, SectionHeader } from "@/components/ui/primitives";
import { MapIcon, PhoneIcon } from "@/components/ui/icons";

export function VenueGuide() {
  const t = useT();
  const g = weddingConfig.venueGuide;
  const blocks = [
    { title: t("venue.parking"), body: g.parking, icon: "🚗" },
    { title: t("venue.restrooms"), body: g.restrooms, icon: "🚻" },
    { title: t("venue.access"), body: g.accessibility, icon: "♿" },
  ];
  return (
    <Section id="venue">
      <div className="container-wide">
        <SectionHeader title={t("venue.title")} subtitle={`${weddingConfig.venue.name}, ${weddingConfig.venue.address}`} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.05}>
              <div className="card h-full p-5">
                <p className="text-2xl" aria-hidden>{b.icon}</p>
                <h3 className="mt-2 text-xl text-maroon">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/85">{b.body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.15}>
            <div className="card h-full p-5">
              <p className="text-2xl" aria-hidden>🍃</p>
              <h3 className="mt-2 text-xl text-maroon">{t("venue.food")}</h3>
              <ul className="mt-2 divide-y divide-gold/20 text-sm">
                {g.food.map((f) => (
                  <li key={f.label} className="flex justify-between gap-3 py-2">
                    <span>{f.label}</span>
                    <span className="shrink-0 font-semibold text-maroon">{f.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="card h-full p-5">
              <p className="text-2xl" aria-hidden>📞</p>
              <h3 className="mt-2 text-xl text-maroon">{t("venue.help")}</h3>
              <ul className="mt-2 space-y-2">
                {g.helplines.map((h) => (
                  <li key={h.phone}>
                    <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="flex min-h-[44px] items-center justify-between gap-2 rounded-xl bg-gold/10 px-3 text-sm hover:bg-gold/20">
                      <span>{h.label}</span>
                      <span className="flex items-center gap-1 font-semibold text-maroon">
                        <PhoneIcon size={15} /> {h.phone}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <a
              href={weddingConfig.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex h-full min-h-[180px] flex-col items-center justify-center gap-3 overflow-hidden p-5 text-center"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, rgb(var(--c-gold) / 0.08) 0 12px, transparent 12px 24px)" }}
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-maroon text-jasmine transition group-hover:scale-110">
                <MapIcon size={26} />
              </span>
              <span className="font-serif text-xl text-maroon">{t("events.maps")}</span>
              <span className="text-xs text-muted">
                {weddingConfig.venue.coordinates.lat}° N, {weddingConfig.venue.coordinates.lng}° E
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
