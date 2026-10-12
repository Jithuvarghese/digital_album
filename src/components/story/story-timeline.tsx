"use client";

import { weddingConfig } from "@/config/wedding.config";
import { useLoc, useT } from "@/state/ui";
import { Reveal, Section, SectionHeader } from "@/components/ui/primitives";

export function StoryTimeline() {
  const t = useT();
  const loc = useLoc();
  return (
    <Section id="story">
      <div className="container-narrow">
        <SectionHeader eyebrow={t("story.eyebrow")} title={t("story.title")} />
        <ol className="relative ml-3 border-l-2 border-dashed border-gold/50 sm:ml-0 sm:border-none">
          <span aria-hidden className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0 sm:block" />
          {weddingConfig.story.map((s, i) => (
            <li key={i} className={`relative mb-10 pl-6 sm:flex sm:w-1/2 sm:pl-0 ${i % 2 ? "sm:ml-auto sm:pl-10" : "sm:pr-10"}`}>
              <span
                aria-hidden
                className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-gold bg-ivory sm:top-6 ${i % 2 ? "sm:-left-2" : "sm:left-auto sm:-right-2"}`}
              />
              <Reveal delay={0.05} className="w-full">
                <article className="card overflow-hidden">
                  <img src={s.photo} alt={loc(s.title)} loading="lazy" className="aspect-[4/3] w-full object-cover" width={800} height={600} />
                  <div className="p-5">
                    <p className="eyebrow">{s.date}</p>
                    <h3 className="mt-1 text-2xl text-maroon">{loc(s.title)}</h3>
                    <p className="mt-2 leading-relaxed text-ink/85">{loc(s.text)}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
