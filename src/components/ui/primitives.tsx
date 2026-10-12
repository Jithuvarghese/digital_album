"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { initials } from "@/lib/text";
import { Jasmine } from "./ornaments";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, center = true }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <Reveal className={`mb-8 ${center ? "text-center" : ""}`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      <div className={`mt-3 flex items-center gap-2 ${center ? "justify-center" : ""}`} aria-hidden>
        <span className="h-px w-10 bg-gold/60" />
        <Jasmine size={14} />
        <span className="h-px w-10 bg-gold/60" />
      </div>
      {subtitle && <p className={`mt-3 text-muted ${center ? "mx-auto max-w-xl" : ""}`}>{subtitle}</p>}
    </Reveal>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 py-14 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

const avatarHues = ["bg-maroon", "bg-leaf", "bg-gold", "bg-groom", "bg-bride", "bg-turmeric"];

export function Avatar({ name, src, size = 48 }: { name: string; src?: string; size?: number }) {
  const hue = avatarHues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarHues.length];
  if (src) return <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover ring-2 ring-gold/40" style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-serif font-semibold text-jasmine ring-2 ring-gold/40 ${hue}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 flex gap-1" aria-hidden>
        <Jasmine size={18} />
        <Jasmine size={24} />
        <Jasmine size={18} />
      </div>
      <p className="font-serif text-xl text-maroon">{title}</p>
      {body && <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card border-l-4 border-maroon px-5 py-4 text-sm">
      <p className="font-semibold text-maroon">The lamp flickered for a moment.</p>
      <p className="mt-1 text-muted">{message ?? "We couldn't load this right now."}</p>
      {onRetry && (
        <button className="btn-ghost btn-sm mt-3" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gold/15 ${className}`} />;
}

export function Tabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string }>; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="mx-auto flex w-full max-w-md rounded-full bg-gold/15 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-[44px] flex-1 rounded-full px-3 text-sm font-semibold transition ${value === o.value ? "bg-maroon text-jasmine shadow" : "text-maroon hover:bg-gold/20"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
