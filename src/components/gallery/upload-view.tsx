"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { useSettings } from "@/data/hooks";
import type { Team } from "@/data/types";
import { ACCEPTED_TYPES, validateImage } from "@/lib/compress";
import { useUploads, type UploadItem, type UploadStatus } from "@/lib/upload-queue";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import type { StringKey } from "@/lib/i18n";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { CameraIcon, CheckIcon, CloseIcon } from "@/components/ui/icons";

const statusKey: Record<UploadStatus, StringKey> = {
  queued: "upload.queued",
  compressing: "upload.compressing",
  uploading: "upload.uploading",
  uploaded: "upload.uploaded",
  pending: "upload.pending",
  failed: "upload.failed",
  error: "common.error",
};

function QueueRow({ item }: { item: UploadItem }) {
  const t = useT();
  const remove = useUploads((s) => s.remove);
  const retryNow = useUploads((s) => s.retryNow);
  const done = item.status === "uploaded" || item.status === "pending";
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="flex items-center gap-3 rounded-2xl bg-paper/80 p-2.5 ring-1 ring-gold/20">
      <img src={item.preview} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.caption || item.name}</p>
        <p className={`flex items-center gap-1 text-xs ${item.status === "error" ? "text-maroon" : done ? "text-leaf" : "text-muted"}`}>
          {done && <CheckIcon size={13} />}
          {t(statusKey[item.status])}
        </p>
        {!done && item.status !== "error" && (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gold/20">
            <motion.div className="h-full bg-maroon" animate={{ width: `${item.progress}%` }} />
          </div>
        )}
      </div>
      {(item.status === "failed" || item.status === "error") && (
        <button className="btn-ghost btn-sm text-xs" onClick={() => retryNow(item.id)}>Retry</button>
      )}
      {(done || item.status === "error" || item.status === "queued") && (
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-gold/10" onClick={() => remove(item.id)} aria-label="Remove">
          <CloseIcon size={16} />
        </button>
      )}
    </motion.li>
  );
}

export function UploadView() {
  const t = useT();
  const device = useDevice();
  const { items, online, add, clearDone } = useUploads();
  const autoApprove = useSettings((s) => s.settings.autoApprove);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [team, setTeam] = useState<Team | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(!weddingConfig.uploadPasscode);
  const [code, setCode] = useState("");
  const pickRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useUploads.setState({ online: navigator.onLine !== false });
  }, []);

  useEffect(() => {
    if (device.hydrated) {
      setName((n) => n || device.guestName);
      setTeam((tm) => tm ?? device.team);
    }
  }, [device.hydrated, device.guestName, device.team]);

  const onFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const cleanName = name.trim();
    if (!cleanName) {
      setErrors(["Please enter your name so the couple knows who shared these."]);
      return;
    }
    if (!device.allowPost(30, 10 * 60_000)) {
      setErrors(["You've shared a lot recently. Please wait a moment before sending more."]);
      return;
    }
    const files = Array.from(list).slice(0, 20);
    const problems: string[] = [];
    const ok = files.filter((f) => {
      const err = validateImage(f);
      if (err) problems.push(`${f.name}: ${err}`);
      return !err;
    });
    setErrors(problems);
    device.setGuestName(cleanName);
    if (ok.length) {
      add(ok, { caption, team, uploaderName: cleanName, guestId: device.guestId, challengeId: null });
      setCaption("");
    }
  };

  const doneCount = items.filter((i) => i.status === "uploaded" || i.status === "pending").length;

  return (
    <Section className="pt-6">
      <div className="container-narrow">
        <SectionHeader title={t("upload.title")} subtitle="Share your favourite moments with the couple. Every photo is a gift." />

        {!online && (
          <p className="mx-auto mb-4 max-w-lg rounded-2xl bg-amber-50 px-4 py-3 text-sm text-ink ring-1 ring-amber-200">
            📶 You&apos;re offline — photos will upload automatically when you reconnect.
          </p>
        )}

        {!unlocked ? (
          <form
            className="card mx-auto max-w-sm space-y-4 p-6 text-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim() === weddingConfig.uploadPasscode) setUnlocked(true);
              else setErrors(["That code doesn't match. It's printed on your invitation."]);
            }}
          >
            <p className="font-serif text-xl text-maroon">Enter the code from your invitation</p>
            <input className="input text-center tracking-[0.3em]" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Invitation code" />
            <button className="btn-primary w-full">Continue</button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card kasavu-frame mx-auto max-w-md space-y-5 p-6"
          >
            {/* Name */}
            <div>
              <label className="label" htmlFor="up-name">{t("upload.name")}</label>
              <input
                id="up-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                autoComplete="name"
                placeholder="e.g. Meera, Anjali's roommate"
              />
            </div>

            {/* Caption (optional) */}
            <div>
              <label className="label" htmlFor="up-caption">
                {t("upload.caption")} <span className="text-xs font-normal text-muted">(optional)</span>
              </label>
              <input
                id="up-caption"
                className="input"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={140}
                placeholder="A short caption..."
              />
            </div>

            {/* Team */}
            <fieldset>
              <legend className="label">{t("upload.team")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {([null, "bride", "groom"] as Array<Team | null>).map((v) => (
                  <label
                    key={String(v)}
                    className={`flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl px-2 text-center text-xs font-semibold ring-1 transition ${
                      team === v
                        ? v === "bride" ? "bg-bride text-jasmine ring-bride" : v === "groom" ? "bg-groom text-jasmine ring-groom" : "bg-maroon text-jasmine ring-maroon"
                        : "bg-jasmine ring-gold/40 hover:bg-gold/10"
                    }`}
                  >
                    <input type="radio" className="sr-only" name="team" checked={team === v} onChange={() => setTeam(v)} />
                    {v === null ? "No team" : t(v === "bride" ? "team.bride" : "team.groom")}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Upload buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn-primary min-h-[52px]" onClick={() => pickRef.current?.click()}>
                📂 Choose Photos
              </button>
              <button type="button" className="btn-gold min-h-[52px]" onClick={() => camRef.current?.click()}>
                <CameraIcon size={18} /> Camera
              </button>
            </div>

            <input ref={pickRef} type="file" accept={ACCEPTED_TYPES.join(",")} multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />

            {errors.length > 0 && (
              <ul role="alert" className="space-y-1 rounded-xl bg-maroon/5 p-3 text-sm text-maroon">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}

            <p className="text-xs leading-relaxed text-muted">
              🔒 {t("upload.privacy")}{autoApprove ? "" : " Photos appear after a family member approves them."}
            </p>
          </motion.div>
        )}

        {items.length > 0 && (
          <div className="mx-auto mt-6 max-w-md">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-maroon">{doneCount}/{items.length} uploaded</p>
              {doneCount > 0 && (
                <button className="text-sm text-muted underline-offset-4 hover:underline" onClick={clearDone}>Clear done</button>
              )}
            </div>
            <ul className="space-y-2" aria-live="polite">
              <AnimatePresence>
                {items.map((i) => <QueueRow key={i.id} item={i} />)}
              </AnimatePresence>
            </ul>
            {doneCount > 0 && (
              <div className="mt-4 text-center">
                <Link href="/gallery" className="btn-ghost btn-sm">View in gallery →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
