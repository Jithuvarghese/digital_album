"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";
import { Jasmine } from "@/components/ui/ornaments";

/** Bride portrait – arch-top frame (left side). */
function ArchPortrait({ src, name, nickname, label, side }: { src?: string; name: string; nickname?: string; label: string; side: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-2"
    >
      {/* Arch-top frame via clip-path */}
      <div className="relative" style={{ width: 110, height: 148 }}>
        <svg viewBox="0 0 110 148" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          <defs>
            <linearGradient id={`arch-grad-${side}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgb(var(--c-gold))" stopOpacity="0.7" />
              <stop offset="1" stopColor="rgb(var(--c-gold))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M4 146 V60 Q4 4 55 4 Q106 4 106 60 V146"
            fill="none"
            stroke={`url(#arch-grad-${side})`}
            strokeWidth="2"
          />
        </svg>
        <div
          className="h-full w-full overflow-hidden bg-gradient-to-br from-gold/10 to-maroon/5"
          style={{ clipPath: "path('M4 148 V60 Q4 4 55 4 Q106 4 106 60 V148 Z')" }}
        >
          {src ? (
            <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-4xl text-gold/40">{name[0]}</span>
            </div>
          )}
        </div>
      </div>
      <p className="eyebrow text-[9px]">{label}</p>
      <p className="font-serif text-base text-maroon leading-tight">{name}</p>
      {nickname && <p className="text-[11px] italic text-muted">&ldquo;{nickname}&rdquo;</p>}
    </motion.div>
  );
}

export function InvitationCard() {
  const { bride, groom, families } = weddingConfig;

  return (
    <section className="container-narrow px-4 py-6">
      {/* Three-column: portrait | invitation | portrait */}
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-4 sm:gap-8">

        {/* Bride portrait */}
        <ArchPortrait
          src={bride.photo}
          name={bride.name}
          nickname={bride.nickname}
          label="The Bride"
          side="left"
        />

        {/* Invitation card (centre) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="kasavu-frame relative flex-1 rounded-[24px] bg-paper px-5 py-7 text-center shadow-card"
        >
          <div className="kasavu-line w-full" />
          <Jasmine size={18} className="mx-auto mt-4 text-gold" />
          <p className="eyebrow mt-4 text-[10px]">A Family Invitation</p>

          <p className="mx-auto mt-4 font-serif text-sm italic leading-relaxed text-ink/85 sm:text-base">
            &ldquo;With hearts full of joy, we invite you and your family to celebrate the wedding of our beloved children.&rdquo;
          </p>

          <div className="my-5 border-t border-gold/30" />

          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">With love from</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="font-serif text-sm leading-snug text-maroon">{families.bride[0]?.name ?? "The Bride's Family"}</p>
              <p className="mt-0.5 text-[10px] text-muted">Bride&apos;s Family · Kochi</p>
            </div>
            <div>
              <p className="font-serif text-sm leading-snug text-maroon">{families.groom[0]?.name ?? "The Groom's Family"}</p>
              <p className="mt-0.5 text-[10px] text-muted">Groom&apos;s Family · Coimbatore</p>
            </div>
          </div>

          <div className="kasavu-line mt-5 w-full" />
        </motion.div>

        {/* Groom portrait */}
        <ArchPortrait
          src={groom.photo}
          name={groom.name}
          nickname={groom.nickname}
          label="The Groom"
          side="right"
        />
      </div>

      {/* Photo mosaic row below */}
      <PhotoMosaic />
    </section>
  );
}

/** A decorative row of 5 photos in varied shapes. */
function PhotoMosaic() {
  const photos = [
    { src: weddingConfig.bride.photo, shape: "oval", alt: "Anjali" },
    { src: "/demo/story/umbrella.svg", shape: "rect-r", alt: "Their story" },
    { src: "/demo/story/proposal.svg", shape: "circle", alt: "Proposal" },
    { src: "/demo/story/coffee.svg", shape: "rect-l", alt: "Coffee" },
    { src: weddingConfig.groom.photo, shape: "oval", alt: "Karthik" },
  ] as const;

  const clip: Record<string, string> = {
    oval: "ellipse(44% 50% at 50% 50%)",
    circle: "circle(44% at 50% 50%)",
    "rect-r": "polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)",
    "rect-l": "polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 80%)",
  };

  return (
    <div className="mt-8 flex items-end justify-center gap-2 sm:gap-4">
      {photos.map((p, i) => {
        const isCenter = i === 2;
        const h = isCenter ? 120 : i % 2 === 0 ? 90 : 100;
        const w = isCenter ? 100 : 80;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 + i * 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.07 }}
            style={{ width: w, height: h, flexShrink: 0 }}
          >
            <div
              className="h-full w-full bg-gradient-to-br from-gold/10 to-maroon/5 ring-1 ring-gold/30"
              style={{ clipPath: clip[p.shape] }}
            >
              <img src={p.src} alt={p.alt} className="h-full w-full object-cover" loading="lazy" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
