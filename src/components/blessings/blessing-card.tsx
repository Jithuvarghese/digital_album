import type { Blessing } from "@/data/types";
import { timeAgo } from "@/lib/text";
import { Jasmine } from "@/components/ui/ornaments";

const styles: Record<Blessing["style"], string> = {
  floral: "bg-[linear-gradient(160deg,rgb(var(--c-paper)),rgb(var(--c-bride)/0.08))] ring-bride/20",
  gold: "bg-[linear-gradient(160deg,rgb(var(--c-paper)),rgb(var(--c-gold)/0.18))] ring-gold/50 kasavu-frame",
  simple: "bg-paper ring-gold/20",
};

export function BlessingCard({ b, large = false }: { b: Blessing; large?: boolean }) {
  return (
    <figure className={`relative rounded-2xl p-5 shadow-card ring-1 ${styles[b.style]} ${large ? "p-8" : ""}`}>
      {b.style === "floral" && (
        <div className="absolute right-3 top-3 flex gap-0.5 opacity-80" aria-hidden>
          <Jasmine size={14} /> <Jasmine size={18} />
        </div>
      )}
      <span aria-hidden className={`font-serif leading-none text-gold ${large ? "text-6xl" : "text-4xl"}`}>“</span>
      <blockquote className={`-mt-3 whitespace-pre-line leading-relaxed text-ink ${large ? "text-3xl" : "text-[15px]"}`}>{b.message}</blockquote>
      <figcaption className={`mt-3 ${large ? "text-xl" : ""}`}>
        <span className="font-serif text-lg font-semibold text-maroon">{b.name}</span>
        {b.relation && <span className="block text-xs text-muted">{b.relation}</span>}
        {!large && <span className="mt-1 block text-[11px] text-muted/80">{timeAgo(b.createdAt)}</span>}
      </figcaption>
    </figure>
  );
}
