"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { weddingConfig, type FamilyMember, type Side } from "@/config/wedding.config";
import { useLoc, useT } from "@/state/ui";
import { Avatar, Section, SectionHeader, Tabs } from "@/components/ui/primitives";
import { SearchIcon } from "@/components/ui/icons";

function MemberCard({ m, side }: { m: FamilyMember; side: Side }) {
  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex items-start gap-3 p-4">
      <Avatar name={m.name} src={m.photo} size={52} />
      <div className="min-w-0">
        <p className="font-serif text-lg leading-tight text-maroon">{m.name}</p>
        <p className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${side === "bride" ? "text-bride" : "text-groom"}`}>{m.relation}</p>
        <p className="mt-1.5 text-sm text-ink/80">{m.note}</p>
      </div>
    </motion.li>
  );
}

export function Families() {
  const t = useT();
  const loc = useLoc();
  const [side, setSide] = useState<Side>("bride");
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;
    return (["bride", "groom"] as Side[]).flatMap((s) =>
      weddingConfig.families[s]
        .filter((m) => `${m.name} ${m.relation} ${m.note}`.toLowerCase().includes(query))
        .map((m) => ({ m, side: s })),
    );
  }, [q]);

  return (
    <Section id="families">
      <div className="container-wide">
        <SectionHeader title={t("families.title")} subtitle="Two families from Kochi and Coimbatore becoming one. Here is who you will meet." />

        <div className="mx-auto mb-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {[weddingConfig.bride, weddingConfig.groom].map((p, i) => (
            <div key={p.name} className="card flex items-center gap-4 p-4">
              <img src={p.photo} alt={p.name} width={96} height={120} loading="lazy" className="h-28 w-[88px] rounded-xl object-cover" />
              <div>
                <p className="eyebrow">{i === 0 ? "The bride" : "The groom"}</p>
                <p className="font-serif text-2xl text-maroon">
                  {p.name} <span className="text-base italic text-muted">“{p.nickname}”</span>
                </p>
                <p className="mt-1 text-sm text-ink/80">{loc(p.bio)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mb-6 max-w-md">
          <label className="relative block">
            <span className="sr-only">{t("families.search")}</span>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("families.search")} className="input pl-10" type="search" />
          </label>
        </div>

        {results ? (
          <div aria-live="polite">
            {results.length ? (
              <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
                {results.map(({ m, side: s }) => (
                  <MemberCard key={m.name} m={m} side={s} />
                ))}
              </ul>
            ) : (
              <p className="card mx-auto max-w-md p-6 text-center text-muted">{t("families.none")}</p>
            )}
          </div>
        ) : (
          <>
            <Tabs
              label={t("families.title")}
              value={side}
              onChange={setSide}
              options={[
                { value: "bride", label: t("families.bride") },
                { value: "groom", label: t("families.groom") },
              ]}
            />
            <ul className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {weddingConfig.families[side].map((m) => (
                  <MemberCard key={side + m.name} m={m} side={side} />
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </div>
    </Section>
  );
}
