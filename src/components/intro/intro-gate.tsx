"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { formatDate } from "@/lib/text";
import { Jasmine, Monogram } from "@/components/ui/ornaments";

type Stage = "loading" | "invite" | "done";

export function IntroGate() {
  const hydrated = useDevice((s) => s.hydrated);
  const introSeen = useDevice((s) => s.introSeen);
  const setIntroSeen = useDevice((s) => s.setIntroSeen);
  const t = useT();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("loading");

  useEffect(() => {
    if (!hydrated) return;
    if (introSeen) {
      setStage("done");
      return;
    }
    setStage("loading");
    const timer = setTimeout(() => setStage("invite"), reduce ? 300 : 1700);
    return () => clearTimeout(timer);
  }, [hydrated, introSeen, reduce]);

  useEffect(() => {
    document.body.style.overflow = stage === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  const open = () => {
    setStage("done");
    setIntroSeen(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ivory"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Petals />
          <AnimatePresence mode="wait">
            {stage === "loading" ? (
              <motion.div key="loading" className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                <motion.div animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2.4 }}>
                  <Monogram className="h-24 w-24" />
                </motion.div>
                <p className="mt-6 font-serif text-xl italic text-maroon" role="status">
                  {t("intro.loading")}
                </p>
              </motion.div>
            ) : (
              <motion.button
                key="invite"
                onClick={open}
                className="kasavu-frame relative mx-4 flex w-full max-w-sm flex-col items-center rounded-[28px] bg-paper px-6 pb-10 pt-4 text-center shadow-card focus-visible:outline-offset-4"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`${t("intro.tap")}: ${weddingConfig.groom.name} & ${weddingConfig.bride.name}`}
              >
                <div className="kasavu-line mt-6 w-full" />
                <p className="eyebrow mt-6">{t("intro.invite")}</p>
                <h1 className="mt-4 font-serif text-5xl leading-tight text-maroon">
                  {weddingConfig.groom.name}
                  <span className="block py-1 text-3xl italic text-gold">&amp;</span>
                  {weddingConfig.bride.name}
                </h1>
                <div className="kasavu-line my-6 w-24" />
                <p className="font-serif text-lg text-ink">{formatDate(weddingConfig.muhurtham.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mt-1 text-sm text-muted">{weddingConfig.venue.name}, Kochi</p>
                <motion.span
                  className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-maroon px-7 text-sm font-semibold tracking-wide text-jasmine"
                  animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                >
                  <Jasmine size={16} /> {t("intro.tap")}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Petals() {
  const reduce = useReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i * 0.73) % 6,
        duration: 9 + (i % 5) * 1.6,
        size: 12 + (i % 4) * 5,
        drift: (i % 2 ? 1 : -1) * (20 + (i % 3) * 15),
      })),
    [],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute -top-8"
          style={{ left: `${p.left}%` }}
          animate={{ y: ["0vh", "110vh"], x: [0, p.drift, 0], rotate: [0, 180, 360] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <Jasmine size={p.size} className="opacity-50" />
        </motion.div>
      ))}
    </div>
  );
}
