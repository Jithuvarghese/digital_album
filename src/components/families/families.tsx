"use client";

import { motion } from "framer-motion";
import { weddingConfig } from "@/config/wedding.config";
import { useLoc, useT } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";

export function Families() {
  const t = useT();
  const loc = useLoc();

  const sides = [
    { key: "bride" as const, label: "Bride's Family", person: weddingConfig.bride },
    { key: "groom" as const, label: "Groom's Family", person: weddingConfig.groom },
  ];

  return (
    <Section id="families">
      <div className="container-wide">
        <SectionHeader title={t("families.title")} subtitle="Two families coming together as one." />

        <div className="grid gap-10 md:grid-cols-2">
          {sides.map(({ key, label, person }, si) => {
            const members = weddingConfig.families[key];
            /* Show only nuclear family: first 4 members (parents + siblings) */
            const nuclear = members.slice(0, 4);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: si * 0.1 }}
                className="card p-6"
              >
                {/* Group photo placeholder / couple portrait */}
                <div className="mb-5 flex items-center gap-4 border-b border-gold/30 pb-5">
                  <div className="relative h-20 w-16 shrink-0">
                    <img
                      src={person.photo}
                      alt={person.name}
                      width={64}
                      height={80}
                      loading="lazy"
                      className="h-full w-full rounded-xl object-cover ring-2 ring-gold/40"
                    />
                  </div>
                  <div>
                    <p className="eyebrow">{label}</p>
                    <p className="font-serif text-2xl text-maroon">{person.name}</p>
                    <p className="mt-1 text-sm text-ink/75">{loc(person.bio)}</p>
                  </div>
                </div>

                {/* Nuclear family members */}
                <ul className="space-y-3">
                  {nuclear.map((m, i) => (
                    <motion.li
                      key={m.name}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: si * 0.1 + i * 0.07 }}
                      className="flex items-start gap-3"
                    >
                      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${key === "bride" ? "bg-bride" : "bg-groom"}`} />
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight text-maroon">{m.name}</p>
                        <p className="text-xs text-muted">{m.relation}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
