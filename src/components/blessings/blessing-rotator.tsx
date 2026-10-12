"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLive } from "@/data/hooks";
import type { Blessing } from "@/data/types";
import { useT } from "@/state/ui";
import { Section, SectionHeader, Skeleton } from "@/components/ui/primitives";
import { BlessingCard } from "./blessing-card";

/** Rotating selection of approved blessings for the home page. */
export function BlessingRotator() {
  const t = useT();
  const { data, loading } = useLive<Blessing[]>(["blessings"], (s) => s.listBlessings({ status: "approved" }), []);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (data.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % data.length), 6000);
    return () => clearInterval(id);
  }, [data.length]);

  const current = data.length ? data[i % data.length] : null;

  return (
    <Section id="blessings-preview">
      <div className="container-narrow">
        <SectionHeader title={t("blessings.home")} />
        <div className="mx-auto min-h-[220px] max-w-lg" aria-live="polite">
          {loading ? (
            <Skeleton className="h-48" />
          ) : current ? (
            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
                <BlessingCard b={current} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="card p-6 text-center text-muted">{t("blessings.empty")}</p>
          )}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/blessings" className="btn-primary">{t("qa.bless")}</Link>
          <Link href="/blessings" className="btn-ghost">{data.length} on the wall</Link>
        </div>
      </div>
    </Section>
  );
}
