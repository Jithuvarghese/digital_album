"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";
import { Jasmine } from "@/components/ui/ornaments";

function ArchPortrait({
  src, name, nickname, label, side,
}: {
  src?: string; name: string; nickname?: string; label: string; side: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex shrink-0 flex-col items-center gap-2"
    >
      {/* Arch portrait — 140×190 on phones, 180×240 on sm+ */}
      <div className="relative h-[190px] w-[140px] sm:h-[240px] sm:w-[180px]">
        <svg viewBox="0 0 180 240" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          <defs>
            <linearGradient id={`ag-${side}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgb(var(--c-gold))" stopOpacity="0.75" />
              <stop offset="1" stopColor="rgb(var(--c-gold))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Outer arch stroke */}
          <path d="M6 238 V96 Q6 6 90 6 Q174 6 174 96 V238" fill="none" stroke={`url(#ag-${side})`} strokeWidth="2.5" />
          {/* Inner arch stroke */}
          <path d="M14 238 V99 Q14 16 90 16 Q166 16 166 99 V238" fill="none" stroke={`url(#ag-${side})`} strokeWidth="1" strokeOpacity="0.4" />
        </svg>
        <div
          className="h-full w-full overflow-hidden"
          style={{
            clipPath: "path('M6 240 V96 Q6 6 90 6 Q174 6 174 96 V240 Z')",
            background: "linear-gradient(135deg, rgba(var(--c-gold),0.12), rgba(var(--c-maroon),0.06))",
          }}
        >
          {src ? (
            <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-5xl text-gold/40">{name[0]}</span>
            </div>
          )}
        </div>
      </div>
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="font-serif text-lg text-maroon sm:text-xl leading-tight">{name}</p>
      {nickname && <p className="text-xs italic text-muted">&ldquo;{nickname}&rdquo;</p>}
    </motion.div>
  );
}

export function InvitationCard() {
  const { bride, groom, families } = weddingConfig;

  return (
    <section className="w-full px-3 py-8 sm:px-4">
      {/* Three-column: portrait | invitation | portrait */}
      {/* On screens < 400px this stacks; on normal phones (≥ 400px) it stays side by side */}
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-center min-[420px]:gap-4 sm:gap-8">

        <ArchPortrait src={bride.photo} name={bride.name} nickname={bride.nickname} label="The Bride" side="left" />

        {/* Centre invitation card — full width when stacked, flex-1 in row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="kasavu-frame w-full rounded-[24px] bg-paper px-6 py-8 text-center shadow-card min-[420px]:min-w-0 min-[420px]:flex-1"
        >
          <div className="kasavu-line w-full" />
          <Jasmine size={20} className="mx-auto mt-5 text-gold" />
          <p className="eyebrow mt-4">A Family Invitation</p>

          <p className="mx-auto mt-4 max-w-xs font-serif text-base italic leading-relaxed text-ink/85 sm:text-lg">
            &ldquo;With hearts full of joy, we invite you and your family to celebrate the wedding of our beloved children.&rdquo;
          </p>

          <div className="my-5 border-t border-gold/30" />

          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">With love from</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="font-serif text-sm leading-snug text-maroon sm:text-base">{families.bride[0]?.name ?? "The Bride's Family"}</p>
              <p className="mt-1 text-xs text-muted">Bride&apos;s Family · Kochi</p>
            </div>
            <div>
              <p className="font-serif text-sm leading-snug text-maroon sm:text-base">{families.groom[0]?.name ?? "The Groom's Family"}</p>
              <p className="mt-1 text-xs text-muted">Groom&apos;s Family · Coimbatore</p>
            </div>
          </div>

          <div className="kasavu-line mt-6 w-full" />
        </motion.div>

        <ArchPortrait src={groom.photo} name={groom.name} nickname={groom.nickname} label="The Groom" side="right" />
      </div>

    </section>
  );
}
