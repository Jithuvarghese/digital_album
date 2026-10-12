"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getStore } from "@/data";
import type { Rsvp } from "@/data/types";
import { hasProfanity, sanitize } from "@/lib/text";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { CheckIcon } from "@/components/ui/icons";
import { Jasmine } from "@/components/ui/ornaments";

export function RsvpForm() {
  const t = useT();
  const guestName = useDevice((s) => s.guestName);
  const setGuestName = useDevice((s) => s.setGuestName);
  const allowPost = useDevice((s) => s.allowPost);
  const [form, setForm] = useState({ name: "", attending: true, guestCount: 2, side: "bride" as Rsvp["side"], meal: "veg" as Rsvp["meal"], note: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const name = form.name || guestName;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitize(name, 80);
    if (!clean) return setError("Please tell us your name.");
    if (hasProfanity(form.note)) return setError("Please keep the note family-friendly.");
    if (!allowPost(3, 60_000)) return setError("You have sent a few RSVPs just now. Please wait a minute.");
    setError("");
    setStatus("saving");
    try {
      await getStore().addRsvp({
        name: clean,
        attending: form.attending,
        guestCount: form.attending ? Math.min(20, Math.max(1, form.guestCount)) : 0,
        side: form.side,
        meal: form.meal,
        note: sanitize(form.note, 400),
      });
      if (!guestName) setGuestName(clean);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Section id="rsvp">
      <div className="container-narrow">
        <SectionHeader title={t("rsvp.title")} subtitle={t("rsvp.subtitle")} />
        <div className="card kasavu-frame mx-auto max-w-lg p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center" role="status">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf text-jasmine">
                  <CheckIcon size={32} />
                </div>
                <p className="font-serif text-2xl text-maroon">{form.attending ? t("rsvp.thanks") : t("rsvp.thanksNo")}</p>
                {form.attending && <p className="mt-2 text-muted">See you on 15 November. A banana leaf has your name on it.</p>}
                <div className="mt-4 flex justify-center gap-1" aria-hidden>
                  <Jasmine /> <Jasmine size={24} /> <Jasmine />
                </div>
                <button className="btn-ghost btn-sm mt-6" onClick={() => setStatus("idle")}>
                  Send another RSVP
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} noValidate>
                <div>
                  <label className="label" htmlFor="rsvp-name">{t("rsvp.name")}</label>
                  <input id="rsvp-name" className="input" value={name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" maxLength={80} required />
                </div>
                <fieldset>
                  <legend className="label">{t("rsvp.attending")}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {[true, false].map((v) => (
                      <label key={String(v)} className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl text-sm font-semibold ring-1 transition ${form.attending === v ? "bg-maroon text-jasmine ring-maroon" : "bg-jasmine ring-gold/40"}`}>
                        <input type="radio" name="attending" className="sr-only" checked={form.attending === v} onChange={() => setForm({ ...form, attending: v })} />
                        {v ? t("rsvp.yes") : t("rsvp.no")}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {form.attending && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="rsvp-count">{t("rsvp.count")}</label>
                      <input id="rsvp-count" type="number" min={1} max={20} inputMode="numeric" className="input" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label" htmlFor="rsvp-meal">{t("rsvp.meal")}</label>
                      <select id="rsvp-meal" className="input" value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value as Rsvp["meal"] })}>
                        <option value="veg">Vegetarian (sadya)</option>
                        <option value="non-veg">Non-vegetarian (reception)</option>
                        <option value="jain">Jain / no onion-garlic</option>
                        <option value="kids">Kids meal</option>
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="rsvp-side">{t("rsvp.side")}</label>
                  <select id="rsvp-side" className="input" value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value as Rsvp["side"] })}>
                    <option value="bride">{t("side.bride")}</option>
                    <option value="groom">{t("side.groom")}</option>
                    <option value="both">{t("side.both")}</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="rsvp-note">{t("rsvp.note")}</label>
                  <textarea id="rsvp-note" className="input min-h-[88px]" maxLength={400} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                {(error || status === "error") && (
                  <p role="alert" className="text-sm text-maroon">{error || t("common.error")}</p>
                )}
                <button type="submit" className="btn-primary w-full" disabled={status === "saving"}>
                  {status === "saving" ? t("common.loading") : t("rsvp.submit")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
