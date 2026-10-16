"use client";

import { weddingConfig } from "@/config/wedding.config";
import { usePhase, useLoc, useT } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { ClockIcon } from "@/components/ui/icons";
import { Jasmine } from "@/components/ui/ornaments";
import { StoryFilm } from "./story-film";
import { VideoPlayer } from "./video-player";

export function FilmsView() {
  const t = useT();
  const loc = useLoc();
  const phase = usePhase();

  return (
    <Section className="pt-6">
      <div className="container-wide">
        <SectionHeader title={t("films.title")} subtitle="Our story in moving pictures. More arrives after the wedding." />

        <div id="story" className="mx-auto max-w-4xl scroll-mt-24">
          <h2 className="mb-3 font-serif text-2xl text-maroon">{t("films.story")}</h2>
          <StoryFilm />
          <p className="mt-2 text-xs text-muted">A preview made from our photos. The full film arrives after the wedding.</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {weddingConfig.films.map((f) => {
            const available = f.src && (f.status === "available" || phase === "after");
            return (
              <article key={f.id} className="card overflow-hidden">
                {available ? (
                  <VideoPlayer src={f.src} poster={f.poster} title={f.title} />
                ) : (
                  <div className="relative">
                    <img src={f.poster} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <span className="flex items-center gap-2 rounded-full bg-jasmine/90 px-4 py-2 text-sm font-semibold text-maroon">
                        <ClockIcon size={16} /> {f.status === "available" ? "Film file coming soon" : t("films.soon")}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-serif text-xl text-maroon">{f.title}</h3>
                  <p className="text-sm text-muted">{f.note}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div id="note" className="mx-auto mt-14 max-w-2xl scroll-mt-24">
          <div className="card kasavu-frame p-8 text-center">
            <div className="mb-3 flex justify-center gap-1" aria-hidden>
              <Jasmine /> <Jasmine size={24} /> <Jasmine />
            </div>
            <p className="eyebrow">A note from the couple</p>
            <p className="mt-4 font-serif text-xl italic leading-relaxed text-ink/90">
              {phase === "after"
                ? loc(weddingConfig.thankYou)
                : "You played, you laughed, you learnt our story. That means more than you know. Come find us at the reception and say hello. Love, Karthik & Anjali."}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
