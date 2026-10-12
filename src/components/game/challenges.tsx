"use client";

import Link from "next/link";
import { weddingConfig } from "@/config/wedding.config";
import { useLive } from "@/data/hooks";
import type { Photo } from "@/data/types";
import { useDevice } from "@/state/device";
import { CameraIcon, CheckIcon, ClockIcon } from "@/components/ui/icons";

export function Challenges() {
  const { guestId, challengesSubmitted } = useDevice();
  const { data } = useLive<Photo[]>(["photos"], (s) => s.listPhotos({ status: "approved" }), []);
  const approved = new Set(data.filter((p) => p.guestId === guestId && p.challengeId).map((p) => p.challengeId!));

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {weddingConfig.challenges.map((c) => {
        const done = approved.has(c.id);
        const submitted = challengesSubmitted.includes(c.id);
        return (
          <li key={c.id} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-xl text-maroon">{c.title}</h3>
              <span className="shrink-0 rounded-full bg-turmeric/20 px-2.5 py-1 text-xs font-bold text-maroon">+{c.points}</span>
            </div>
            <p className="mt-1 flex-1 text-sm text-ink/80">{c.hint}</p>
            {done ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-leaf">
                <CheckIcon size={16} /> Approved, points added
              </p>
            ) : submitted ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                <ClockIcon size={16} /> Waiting for the family to approve
              </p>
            ) : (
              <Link href={`/upload?challenge=${c.id}`} className="btn-ghost btn-sm mt-3 self-start">
                <CameraIcon size={16} /> Take the photo
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
