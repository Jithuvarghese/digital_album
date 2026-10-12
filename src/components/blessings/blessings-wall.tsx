"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getStore } from "@/data";
import { useLive } from "@/data/hooks";
import type { Blessing, BlessingStyle } from "@/data/types";
import { hasProfanity, sanitize } from "@/lib/text";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { EmptyState, ErrorState, Section, SectionHeader, Skeleton } from "@/components/ui/primitives";
import { BlessingCard } from "./blessing-card";

const PAGE = 9;
const styleOptions: Array<{ value: BlessingStyle; label: string; swatch: string }> = [
  { value: "floral", label: "Floral", swatch: "bg-[linear-gradient(135deg,#fff,rgb(var(--c-bride)/0.35))]" },
  { value: "gold", label: "Gold", swatch: "bg-[linear-gradient(135deg,#fff,rgb(var(--c-gold)/0.7))]" },
  { value: "simple", label: "Simple", swatch: "bg-paper" },
];

function BlessingForm() {
  const t = useT();
  const guestName = useDevice((s) => s.guestName);
  const setGuestName = useDevice((s) => s.setGuestName);
  const allowPost = useDevice((s) => s.allowPost);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [message, setMessage] = useState("");
  const [style, setStyle] = useState<BlessingStyle>("floral");
  const [state, setState] = useState<"idle" | "saving" | "pending" | "posted">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (guestName) setName((n) => n || guestName);
  }, [guestName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = { name: sanitize(name, 60), relation: sanitize(relation, 80), message: sanitize(message, 600) };
    if (!clean.name || clean.message.length < 2) return setError("Please add your name and a few words.");
    if (hasProfanity(`${clean.name} ${clean.relation} ${clean.message}`)) return setError("Let's keep it sweet for the grandparents. Please rephrase a little.");
    if (!allowPost(3, 60_000)) return setError("You've posted a few blessings just now. Please wait a minute.");
    setError("");
    setState("saving");
    try {
      const b = await getStore().addBlessing({ ...clean, style });
      setGuestName(clean.name);
      setMessage("");
      setState(b.status === "approved" ? "posted" : "pending");
    } catch {
      setState("idle");
      setError(t("common.error"));
    }
  };

  return (
    <div className="card kasavu-frame mx-auto mb-10 max-w-lg p-6">
      <AnimatePresence mode="wait">
        {state === "pending" || state === "posted" ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center" role="status">
            <p className="text-4xl" aria-hidden>🪔</p>
            <p className="mt-2 font-serif text-xl text-maroon">{state === "posted" ? t("blessings.posted") : t("blessings.pending")}</p>
            <button className="btn-ghost btn-sm mt-4" onClick={() => setState("idle")}>
              Write another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="space-y-3" noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="bl-name">{t("blessings.name")}</label>
                <input id="bl-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="bl-rel">{t("blessings.relation")}</label>
                <input id="bl-rel" className="input" value={relation} onChange={(e) => setRelation(e.target.value)} maxLength={80} placeholder={t("blessings.relationHint")} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="bl-msg">{t("blessings.message")}</label>
              <textarea id="bl-msg" className="input min-h-[110px]" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={600} placeholder="Wishing you both…" />
              <p className="mt-1 text-right text-xs text-muted">{message.length}/600</p>
            </div>
            <fieldset>
              <legend className="label">{t("blessings.style")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {styleOptions.map((o) => (
                  <label key={o.value} className={`flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl px-3 text-sm ring-1 ${style === o.value ? "ring-2 ring-maroon" : "ring-gold/40"}`}>
                    <input type="radio" className="sr-only" name="style" checked={style === o.value} onChange={() => setStyle(o.value)} />
                    <span className={`h-6 w-6 rounded-full ring-1 ring-gold/40 ${o.swatch}`} aria-hidden />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {error && <p role="alert" className="text-sm text-maroon">{error}</p>}
            <button className="btn-primary w-full" disabled={state === "saving"}>
              {state === "saving" ? t("common.loading") : t("blessings.submit")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BlessingsWall() {
  const t = useT();
  const { data, loading, error, reload } = useLive<Blessing[]>(["blessings"], (s) => s.listBlessings({ status: "approved" }), []);
  const [limit, setLimit] = useState(PAGE);

  return (
    <Section className="pt-6">
      <div className="container-wide">
        <SectionHeader title={t("blessings.title")} subtitle={t("blessings.subtitle")} />
        <BlessingForm />
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="masonry">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState title={t("blessings.empty")} />
        ) : (
          <>
            <ul className="masonry" aria-live="polite">
              <AnimatePresence initial={false}>
                {data.slice(0, limit).map((b) => (
                  <motion.li key={b.id} layout initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                    <BlessingCard b={b} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {data.length > limit && (
              <div className="mt-6 text-center">
                <button className="btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
                  {t("blessings.more")} ({data.length - limit})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
