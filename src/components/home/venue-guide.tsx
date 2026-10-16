"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";
import { useT } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { MapIcon, PhoneIcon } from "@/components/ui/icons";

export function VenueGuide() {
  const t = useT();
  const g = weddingConfig.venueGuide;

  const blocks = [
    { title: t("venue.parking"), body: g.parking, icon: "🚘", bg: "bg-amber-50" },
    { title: t("venue.restrooms"), body: g.restrooms, icon: "🚿", bg: "bg-blue-50" },
    { title: t("venue.access"), body: g.accessibility, icon: "🦽", bg: "bg-green-50" },
  ];

  return (
    <Section id="venue">
      <div className="container-wide">
        <SectionHeader title={t("venue.title")} subtitle={`${weddingConfig.venue.name} · ${weddingConfig.venue.address}`} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card flex items-start gap-4 p-5"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${b.bg}`}>
                {b.icon}
              </span>
              <div>
                <h3 className="font-semibold text-maroon">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">{b.body}</p>
              </div>
            </motion.div>
          ))}

          {/* Food timings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="card p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-xl">🍽️</span>
              <h3 className="font-semibold text-maroon">{t("venue.food")}</h3>
            </div>
            <ul className="divide-y divide-gold/20 text-sm">
              {g.food.map((f) => (
                <li key={f.label} className="flex justify-between gap-3 py-2">
                  <span className="text-ink/80">{f.label}</span>
                  <span className="shrink-0 font-semibold text-maroon">{f.time}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Helpline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22 }}
            className="card p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl">📞</span>
              <h3 className="font-semibold text-maroon">{t("venue.help")}</h3>
            </div>
            <ul className="space-y-2">
              {g.helplines.map((h) => (
                <li key={h.phone}>
                  <a
                    href={`tel:${h.phone.replace(/\s/g, "")}`}
                    className="flex min-h-[44px] items-center justify-between gap-2 rounded-xl bg-gold/8 px-3 text-sm hover:bg-gold/15 transition"
                  >
                    <span className="text-ink/80">{h.label}</span>
                    <span className="flex items-center gap-1 font-semibold text-maroon">
                      <PhoneIcon size={14} /> {h.phone}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Map CTA */}
          <motion.a
            href={weddingConfig.venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.26 }}
            className="card group flex min-h-[140px] flex-col items-center justify-center gap-3 p-5 text-center hover:-translate-y-1 transition duration-300"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-maroon text-jasmine transition group-hover:scale-110">
              <MapIcon size={26} />
            </span>
            <span className="font-serif text-xl text-maroon">{t("events.maps")}</span>
            <span className="text-xs text-muted">
              {weddingConfig.venue.coordinates.lat}° N, {weddingConfig.venue.coordinates.lng}° E
            </span>
          </motion.a>
        </div>
      </div>
    </Section>
  );
}
