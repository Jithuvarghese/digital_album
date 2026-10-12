"use client";

import { useRef, useState } from "react";
import { weddingConfig, type Ritual } from "@/config/wedding.config";
import { useLoc, useT } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { Jasmine, Lamp } from "@/components/ui/ornaments";

function RitualIcon({ icon }: { icon: Ritual["icon"] }) {
  const common = "h-16 w-16";
  switch (icon) {
    case "lamp":
      return <Lamp className="h-20 w-12" />;
    case "turmeric":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <ellipse cx="32" cy="44" rx="22" ry="8" fill="rgb(var(--c-gold))" />
          <path d="M10 40 Q32 60 54 40 L52 34 Q32 50 12 34Z" fill="rgb(var(--c-accent))" />
          <circle cx="26" cy="22" r="6" fill="rgb(var(--c-accent))" />
          <circle cx="38" cy="18" r="4" fill="rgb(var(--c-accent))" />
        </svg>
      );
    case "thali":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M12 10 Q32 52 52 10" fill="none" stroke="rgb(var(--c-gold))" strokeWidth="2.5" strokeDasharray="1 3" strokeLinecap="round" />
          <path d="M32 38 l8 8 -8 10 -8 -10z" fill="rgb(var(--c-gold))" />
          <circle cx="32" cy="47" r="2.5" fill="rgb(var(--c-maroon))" />
        </svg>
      );
    case "steps":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <circle cx="32" cy="32" r="8" fill="rgb(var(--c-accent))" />
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2;
            const x = 32 + Math.cos(a) * 22;
            const y = 32 + Math.sin(a) * 22;
            return <ellipse key={i} cx={x} cy={y} rx="3.5" ry="5.5" fill="rgb(var(--c-maroon))" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />;
          })}
        </svg>
      );
    case "hands":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M8 40 Q20 30 32 34 Q44 30 56 40 L52 48 Q32 42 12 48Z" fill="rgb(var(--c-gold))" />
          <circle cx="32" cy="24" r="7" fill="rgb(var(--c-accent))" />
          <path d="M32 17 v-6" stroke="rgb(var(--c-green))" strokeWidth="2" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M4 36 Q32 10 60 30 Q32 56 4 36Z" fill="rgb(var(--c-green))" />
          <path d="M6 35 L58 30" stroke="#DCEBC8" strokeWidth="1.2" />
          <circle cx="22" cy="30" r="3.5" fill="rgb(var(--c-accent))" />
          <circle cx="34" cy="36" r="3" fill="#C0392B" />
          <circle cx="44" cy="30" r="3" fill="#fff" />
        </svg>
      );
    case "garland":
      return (
        <div className="flex h-16 items-end gap-0.5" aria-hidden>
          {[14, 18, 22, 18, 14].map((s, i) => (
            <Jasmine key={i} size={s} />
          ))}
        </div>
      );
  }
}

export function Rituals() {
  const t = useT();
  const loc = useLoc();
  const scroller = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const items = weddingConfig.rituals;

  const step = () => {
    const card = scroller.current?.children[0] as HTMLElement | undefined;
    return (card?.offsetWidth ?? 300) + 16;
  };
  const go = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  return (
    <Section id="rituals" className="bg-maroon/[0.03]">
      <div className="container-wide">
        <SectionHeader eyebrow={t("rituals.eyebrow")} title={t("rituals.title")} subtitle="Swipe through the ceremonies you will see, each explained in under a minute." />
        <ul
          ref={scroller}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / step()))}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
          aria-label={t("rituals.title")}
        >
          {items.map((r, i) => (
            <li key={r.id} className="w-[82%] max-w-[340px] shrink-0 snap-center sm:w-[320px]">
              <article className="card kasavu-frame flex h-full flex-col p-6" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}>
                <div className="flex h-20 items-center justify-center">
                  <RitualIcon icon={r.icon} />
                </div>
                <h3 className="mt-3 text-center text-2xl text-maroon">{loc(r.title)}</h3>
                {r.subtitle && <p className="text-center text-xs uppercase tracking-widest text-gold">{r.subtitle}</p>}
                <p className="mt-4 flex-1 leading-relaxed text-ink/85">{loc(r.summary)}</p>
                <div className="mt-4 rounded-xl bg-gold/10 p-3 text-sm">
                  <p className="font-semibold text-maroon">{t("rituals.why")}</p>
                  <p className="mt-1 text-ink/85">{loc(r.why)}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-center gap-4">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-gold/40 hover:bg-gold/10" onClick={() => go(-1)} aria-label="Previous ritual">
            <ChevronLeft />
          </button>
          <div className="flex gap-1.5" aria-hidden>
            {items.map((r, i) => (
              <span key={r.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-maroon" : "w-1.5 bg-gold/50"}`} />
            ))}
          </div>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-gold/40 hover:bg-gold/10" onClick={() => go(1)} aria-label="Next ritual">
            <ChevronRight />
          </button>
        </div>
      </div>
    </Section>
  );
}
