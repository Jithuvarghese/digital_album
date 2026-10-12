"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { getStore } from "@/data";
import { useLive } from "@/data/hooks";
import { formatDate, hasProfanity, sanitize } from "@/lib/text";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { CapsuleIcon, LockIcon } from "@/components/ui/icons";

function useCountdownDays(iso: string) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => setDays(Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))), [iso]);
  return days;
}

export function CapsuleView() {
  const t = useT();
  const { guestName, setGuestName, allowPost } = useDevice();
  const { data: count } = useLive<number>(["capsule"], (s) => s.countCapsule(), 0);
  const days = useCountdownDays(weddingConfig.firstAnniversary);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "sealed">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (guestName) setName((n) => n || guestName);
  }, [guestName]);

  const seal = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = { name: sanitize(name, 60), message: sanitize(message, 1000) };
    if (!clean.name || clean.message.length < 2) return setError("Please add your name and a message.");
    if (hasProfanity(clean.message)) return setError("Please keep it family-friendly.");
    if (!allowPost(3, 60_000)) return setError("Please wait a minute before sealing another message.");
    setError("");
    setState("saving");
    try {
      await getStore().addCapsule({ ...clean, unlockAt: weddingConfig.firstAnniversary });
      setGuestName(clean.name);
      setMessage("");
      setState("sealed");
    } catch {
      setState("idle");
      setError(t("common.error"));
    }
  };

  return (
    <Section className="pt-6">
      <div className="container-narrow">
        <SectionHeader title={t("capsule.title")} subtitle={t("capsule.subtitle")} />

        <div className="mx-auto mb-8 grid max-w-lg grid-cols-2 gap-3 text-center">
          <div className="card p-4">
            <motion.p key={count} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-serif text-4xl text-maroon">{count}</motion.p>
            <p className="text-xs uppercase tracking-wider text-muted">{t("capsule.sealed")}</p>
          </div>
          <div className="card p-4">
            <p className="font-serif text-xl text-maroon">{formatDate(weddingConfig.firstAnniversary, { day: "numeric", month: "short", year: "numeric" })}</p>
            <p className="text-xs uppercase tracking-wider text-muted">
              {t("capsule.opens")} {days !== null && `· ${days} days`}
            </p>
          </div>
        </div>

        <div className="card kasavu-frame mx-auto max-w-lg overflow-hidden">
          <AnimatePresence mode="wait">
            {state === "sealed" ? (
              <motion.div key="sealed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center" role="status">
                <motion.div initial={{ y: -30, rotate: -8 }} animate={{ y: 0, rotate: 0 }} transition={{ type: "spring" }} className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-maroon text-gold">
                  <LockIcon size={36} />
                </motion.div>
                <p className="font-serif text-2xl text-maroon">{t("capsule.done")}</p>
                <button className="btn-ghost btn-sm mt-5" onClick={() => setState("idle")}>
                  Write another
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={seal} className="space-y-3 p-6" noValidate>
                <div className="flex items-center gap-3 rounded-xl bg-gold/10 p-3 text-sm">
                  <CapsuleIcon className="shrink-0 text-maroon" />
                  <p>Only Karthik and Anjali can read these, and only from their first anniversary. Ideas: a wish for year one, a prediction, a memory from today.</p>
                </div>
                <div>
                  <label className="label" htmlFor="cap-name">{t("blessings.name")}</label>
                  <input id="cap-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
                </div>
                <div>
                  <label className="label" htmlFor="cap-msg">Your message for 15 November 2027</label>
                  <textarea id="cap-msg" className="input min-h-[140px]" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} placeholder="Dear Karthik and Anjali, one year ago today…" />
                </div>
                {error && <p role="alert" className="text-sm text-maroon">{error}</p>}
                <button className="btn-primary w-full" disabled={state === "saving"}>
                  <LockIcon size={16} /> {state === "saving" ? t("common.loading") : t("capsule.write")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
