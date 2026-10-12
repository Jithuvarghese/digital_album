"use client";

import Link from "next/link";
import { weddingConfig } from "@/config/wedding.config";
import { useLive } from "@/data/hooks";
import type { Blessing, Photo } from "@/data/types";
import { formatDate } from "@/lib/text";
import { useLoc } from "@/state/ui";
import { Garland, Jasmine, Lamp, Monogram } from "@/components/ui/ornaments";
import { PrintIcon } from "@/components/ui/icons";

/** Print-friendly keepsake. "Print" in the browser saves it as a PDF. */
export function MemoryBook() {
  const loc = useLoc();
  const { data: photos } = useLive<Photo[]>(["photos"], (s) => s.listPhotos({ status: "approved" }), []);
  const { data: blessings } = useLive<Blessing[]>(["blessings"], (s) => s.listBlessings({ status: "approved" }), []);
  const top = [...photos].sort((a, b) => b.likes - a.likes).slice(0, 12);
  const chosen = [...blessings].sort((a, b) => (a.style === "gold" ? -1 : 0) - (b.style === "gold" ? -1 : 0) || b.message.length - a.message.length).slice(0, 10);

  return (
    <div className="memory-book bg-white text-ink">
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          .mb-page { break-after: page; box-shadow: none !important; margin: 0 !important; }
          .mb-avoid { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gold/30 bg-ivory/95 px-4 py-3 backdrop-blur">
        <Link href="/" className="btn-ghost btn-sm">← Back</Link>
        <p className="hidden text-sm text-muted sm:block">Tip: choose &ldquo;Save as PDF&rdquo; in the print dialog.</p>
        <button className="btn-primary btn-sm" onClick={() => window.print()}>
          <PrintIcon size={16} /> Print / Save PDF
        </button>
      </div>

      <section className="mb-page mx-auto flex min-h-[100vh] max-w-[210mm] flex-col items-center justify-center p-10 text-center print:min-h-[260mm]">
        <Garland className="h-14 w-full" />
        <Monogram className="mt-10 h-24 w-24" />
        <p className="eyebrow mt-8">Our wedding memory book</p>
        <h1 className="mt-4 font-serif text-6xl text-maroon">
          {weddingConfig.groom.name} <span className="italic text-gold">&amp;</span> {weddingConfig.bride.name}
        </h1>
        <p className="mt-4 font-serif text-2xl">{formatDate(weddingConfig.muhurtham.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        <p className="text-muted">{weddingConfig.venue.name}, Kochi</p>
        <Lamp className="mt-12 h-32 w-20" />
      </section>

      <section className="mb-page mx-auto max-w-[210mm] p-10">
        <h2 className="text-center font-serif text-4xl text-maroon">Our story</h2>
        <div className="kasavu-line mx-auto my-6 w-32" />
        <div className="space-y-6">
          {weddingConfig.story.map((s, i) => (
            <div key={i} className="mb-avoid flex gap-5">
              <img src={s.photo} alt="" className="h-28 w-36 shrink-0 rounded-lg object-cover" />
              <div>
                <p className="eyebrow">{s.date}</p>
                <h3 className="font-serif text-2xl text-maroon">{loc(s.title)}</h3>
                <p className="mt-1 text-sm leading-relaxed">{loc(s.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-page mx-auto max-w-[210mm] p-10">
        <h2 className="text-center font-serif text-4xl text-maroon">Moments you loved</h2>
        <div className="kasavu-line mx-auto my-6 w-32" />
        <div className="grid grid-cols-3 gap-3">
          {top.map((p) => (
            <figure key={p.id} className="mb-avoid">
              <img src={p.thumbUrl} alt={p.caption} className="aspect-square w-full rounded-lg object-cover" />
              <figcaption className="mt-1 text-[11px] text-muted">
                {p.caption || "Untitled"} · {p.uploaderName} · ♥ {p.likes}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-page mx-auto max-w-[210mm] p-10">
        <h2 className="text-center font-serif text-4xl text-maroon">Blessings</h2>
        <div className="kasavu-line mx-auto my-6 w-32" />
        <div className="columns-2 gap-6">
          {chosen.map((b) => (
            <blockquote key={b.id} className="mb-avoid mb-5 break-inside-avoid border-l-2 border-gold pl-4">
              <p className="font-serif text-lg italic leading-snug">&ldquo;{b.message}&rdquo;</p>
              <footer className="mt-1 text-xs text-muted">
                {b.name}
                {b.relation && `, ${b.relation}`}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-[210mm] flex-col items-center p-10 text-center">
        <div className="flex gap-1" aria-hidden>
          <Jasmine /> <Jasmine size={26} /> <Jasmine />
        </div>
        <h2 className="mt-4 font-serif text-4xl text-maroon">Thank you</h2>
        <p className="mt-4 max-w-lg font-serif text-xl italic leading-relaxed">{loc(weddingConfig.thankYou)}</p>
        <p className="mt-8 text-sm text-gold">{weddingConfig.hashtag}</p>
      </section>
    </div>
  );
}
