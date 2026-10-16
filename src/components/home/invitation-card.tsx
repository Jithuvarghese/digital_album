"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";
import { Jasmine } from "@/components/ui/ornaments";

/** Bride/Groom portrait in an arch-top frame. Size adapts via CSS vars set on the parent. */
function ArchPortrait({
  src, name, nickname, label, side,
}: {
  src?: string; name: string; nickname?: string; label: string; side: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -16 : 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex shrink-0 flex-col items-center gap-1.5"
    >
      {/* Arch frame — 80px wide on phones, 110px on sm+ */}
      <div className="relative h-[104px] w-[80px] sm:h-[148px] sm:w-[110px]">
        <svg viewBox="0 0 110 148" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          <defs>
            <linearGradient id={`ag-${side}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgb(var(--c-gold))" stopOpacity="0.7" />
              <stop offset="1" stopColor="rgb(var(--c-gold))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M4 146 V60 Q4 4 55 4 Q106 4 106 60 V146" fill="none" stroke={`url(#ag-${side})`} strokeWidth="2.5" />
        </svg>
        <div
          className="h-full w-full overflow-hidden bg-gradient-to-br from-gold/10 to-maroon/5"
          style={{ clipPath: "path('M4 148 V60 Q4 4 55 4 Q106 4 106 60 V148 Z')" }}
        >
          {src ? (
            <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-3xl text-gold/40">{name[0]}</span>
            </div>
          )}
        </div>
      </div>
      <p className="eyebrow text-[9px] sm:text-[10px]">{label}</p>
      <p className="font-serif text-sm text-maroon sm:text-base leading-tight">{name}</p>
      {nickname && <p className="text-[10px] italic text-muted">&ldquo;{nickname}&rdquo;</p>}
    </motion.div>
  );
}

export function InvitationCard() {
  const { bride, groom, families } = weddingConfig;

  return (
    <section className="w-full px-3 py-6 sm:px-4">
      {/* Three-column row: portrait | card | portrait */}
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 sm:gap-6">

        <ArchPortrait src={bride.photo} name={bride.name} nickname={bride.nickname} label="The Bride" side="left" />

        {/* Centre invitation card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="kasavu-frame relative min-w-0 flex-1 rounded-[20px] bg-paper px-4 py-6 text-center shadow-card sm:rounded-[24px] sm:px-6 sm:py-8"
        >
          <div className="kasavu-line w-full" />
          <Jasmine size={16} className="mx-auto mt-3 text-gold sm:mt-4 sm:text-xl" />
          <p className="eyebrow mt-3 text-[9px] sm:text-[10px]">A Family Invitation</p>

          <p className="mx-auto mt-3 font-serif text-xs italic leading-relaxed text-ink/85 sm:text-sm">
            &ldquo;With hearts full of joy, we invite you and your family to celebrate the wedding of our beloved children.&rdquo;
          </p>

          <div className="my-4 border-t border-gold/30" />

          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted sm:text-[10px]">With love from</p>

          <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="font-serif text-xs leading-snug text-maroon sm:text-sm">{families.bride[0]?.name ?? "The Bride's Family"}</p>
              <p className="mt-0.5 text-[9px] text-muted">Bride&apos;s Family · Kochi</p>
            </div>
            <div>
              <p className="font-serif text-xs leading-snug text-maroon sm:text-sm">{families.groom[0]?.name ?? "The Groom's Family"}</p>
              <p className="mt-0.5 text-[9px] text-muted">Groom&apos;s Family · Coimbatore</p>
            </div>
          </div>

          <div className="kasavu-line mt-4 w-full" />
        </motion.div>

        <ArchPortrait src={groom.photo} name={groom.name} nickname={groom.nickname} label="The Groom" side="right" />
      </div>

      {/* Photo mosaic */}
      <PhotoMosaic />
    </section>
  );
}

const CLIP: Record<string, string> = {
  oval:    "ellipse(44% 50% at 50% 50%)",
  circle:  "circle(44% at 50% 50%)",
  "rect-r": "polygon(0 0, 100% 0, 100% 78%, 78% 100%, 0 100%)",
  "rect-l": "polygon(0 0, 100% 0, 100% 100%, 22% 100%, 0 78%)",
  arch:    "path('M4 148 V60 Q4 4 55 4 Q106 4 106 60 V148 Z')",
};

const MOSAIC = [
  { src: "/demo/story/umbrella.svg", shape: "rect-r", alt: "Their story",  w: 72,  h: 88 },
  { src: "/demo/story/coffee.svg",   shape: "oval",   alt: "Coffee",       w: 64,  h: 80 },
  { src: "/demo/story/proposal.svg", shape: "circle", alt: "Proposal",     w: 88,  h: 88 },
  { src: "/demo/story/calls.svg",    shape: "oval",   alt: "Long distance",w: 64,  h: 80 },
  { src: "/demo/story/mandapam.svg", shape: "rect-l", alt: "The wedding",  w: 72,  h: 88 },
] as const;

function PhotoMosaic() {
  return (
    <div className="mx-auto mt-7 flex max-w-sm items-end justify-center gap-2 overflow-x-auto sm:gap-3">
      {MOSAIC.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: i * 0.07 }}
          className="shrink-0"
          style={{ width: p.w, height: p.h }}
        >
          <div
            className="h-full w-full bg-gradient-to-br from-gold/15 to-maroon/5 ring-1 ring-gold/25"
            style={{ clipPath: CLIP[p.shape] }}
          >
            <img src={p.src} alt={p.alt} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
