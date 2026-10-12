"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useT } from "@/state/ui";
import { Avatar, Section, SectionHeader } from "@/components/ui/primitives";

export function ChatReveal() {
  const t = useT();
  const lines = weddingConfig.chat;
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const done = shown >= lines.length;

  const next = () => {
    if (typing) return;
    if (done) {
      setShown(1);
      return;
    }
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setShown((n) => Math.min(lines.length, n + 1));
    }, 650);
  };

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  const nextFrom = lines[shown]?.from;

  return (
    <Section id="how-we-met" className="bg-gradient-to-b from-transparent via-gold/5 to-transparent">
      <div className="container-narrow">
        <SectionHeader title={t("chat.title")} />
        <div className="mx-auto max-w-md overflow-hidden rounded-[28px] bg-paper shadow-card ring-1 ring-gold/30">
          <div className="flex items-center gap-3 bg-maroon px-4 py-3 text-jasmine">
            <div className="flex -space-x-3">
              <Avatar name={weddingConfig.groom.name} src={weddingConfig.groom.photo} size={38} />
              <Avatar name={weddingConfig.bride.name} src={weddingConfig.bride.photo} size={38} />
            </div>
            <div>
              <p className="font-semibold leading-tight">{weddingConfig.groom.name} &amp; {weddingConfig.bride.name}</p>
              <p className="text-xs text-jasmine/75">{t("chat.online")}</p>
            </div>
          </div>
          <div
            ref={listRef}
            className="h-[420px] space-y-2 overflow-y-auto px-3 py-4"
            style={{ backgroundImage: "radial-gradient(rgb(var(--c-gold) / 0.12) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
            aria-live="polite"
          >
            <AnimatePresence initial={false}>
              {lines.slice(0, shown).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={line.from === "system" ? "flex justify-center" : line.from === "bride" ? "flex justify-end" : "flex justify-start"}
                >
                  {line.from === "system" ? (
                    <p className="max-w-[90%] rounded-full bg-gold/20 px-3 py-1.5 text-center text-xs text-ink/80">{line.text}</p>
                  ) : (
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] shadow-sm ${line.from === "bride" ? "rounded-br-sm bg-bride/90 text-jasmine" : "rounded-bl-sm bg-jasmine text-ink ring-1 ring-gold/20"}`}>
                      <p className="mb-0.5 text-[11px] font-semibold opacity-70">{line.from === "bride" ? weddingConfig.bride.name : weddingConfig.groom.name}</p>
                      <p>{line.text}</p>
                      {line.time && <p className="mt-0.5 text-right text-[10px] opacity-60">{line.time}</p>}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && nextFrom !== "system" && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex ${nextFrom === "bride" ? "justify-end" : "justify-start"}`}>
                  <span className="inline-flex gap-1 rounded-2xl bg-jasmine px-3 py-3 ring-1 ring-gold/20" aria-label="typing">
                    {[0, 1, 2].map((d) => (
                      <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />
                    ))}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={next} className="flex min-h-[52px] w-full items-center justify-center border-t border-gold/20 bg-paper text-sm font-semibold text-maroon hover:bg-gold/10">
            {done ? t("chat.restart") : `${t("chat.tap")} (${shown}/${lines.length})`}
          </button>
        </div>
      </div>
    </Section>
  );
}
