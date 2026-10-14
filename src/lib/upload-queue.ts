"use client";

import { create } from "zustand";
import { getStore } from "@/data";
import type { Team } from "@/data/types";
import { compressImage } from "./compress";
import { uid } from "./id";
import { sanitize } from "./text";

export type UploadStatus = "queued" | "compressing" | "uploading" | "uploaded" | "pending" | "failed" | "error";

export interface UploadItem {
  id: string;
  file: File;
  preview: string;
  name: string;
  caption: string;
  team: Team | null;
  uploaderName: string;
  guestId: string;
  challengeId: string | null;
  status: UploadStatus;
  progress: number;
  attempts: number;
  error?: string;
  nextRetryAt?: number;
}

interface QueueState {
  items: UploadItem[];
  online: boolean;
  add: (files: File[], meta: Pick<UploadItem, "caption" | "team" | "uploaderName" | "guestId" | "challengeId">) => void;
  remove: (id: string) => void;
  clearDone: () => void;
  retryNow: (id: string) => void;
}

const MAX_ATTEMPTS = 6;
let running = false;
let wakeTimer: ReturnType<typeof setTimeout> | undefined;

export const useUploads = create<QueueState>((set, get) => ({
  items: [],
  // Assume online until the browser says otherwise, so server and client render the same markup
  online: true,
  add: (files, meta) => {
    const items = files.map<UploadItem>((file) => ({
      id: uid(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      ...meta,
      caption: sanitize(meta.caption, 140),
      uploaderName: sanitize(meta.uploaderName, 40),
      status: "queued",
      progress: 0,
      attempts: 0,
    }));
    set((s) => ({ items: [...s.items, ...items] }));
    void pump();
  },
  remove: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },
  clearDone: () => set((s) => ({ items: s.items.filter((i) => !["uploaded", "pending"].includes(i.status)) })),
  retryNow: (id) => {
    patch(id, { status: "queued", nextRetryAt: undefined, attempts: 0, error: undefined });
    void pump();
  },
}));

function patch(id: string, p: Partial<UploadItem>) {
  useUploads.setState((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...p } : i)) }));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Processes queued uploads one at a time, with exponential backoff and pause while offline. */
async function pump() {
  if (running) return;
  running = true;
  try {
    for (;;) {
      const { items, online } = useUploads.getState();
      if (!online) break;
      const now = Date.now();
      const next = items.find((i) => (i.status === "queued" || i.status === "failed") && (!i.nextRetryAt || i.nextRetryAt <= now));
      if (!next) {
        const waiting = items.filter((i) => i.status === "failed" && i.nextRetryAt).map((i) => i.nextRetryAt!);
        if (waiting.length) {
          clearTimeout(wakeTimer);
          wakeTimer = setTimeout(() => void pump(), Math.max(200, Math.min(...waiting) - now));
        }
        break;
      }
      await process(next);
    }
  } finally {
    running = false;
  }
}

async function process(item: UploadItem) {
  try {
    patch(item.id, { status: "compressing", progress: 5, error: undefined });
    const { full, medium, thumb } = await compressImage(item.file);
    patch(item.id, { status: "uploading", progress: 20 });

    // Progress for the browser store is simulated; Supabase uploads finish in one request.
    let p = 20;
    const ticker = setInterval(() => {
      p = Math.min(90, p + 12);
      patch(item.id, { progress: p });
    }, 180);
    const store = getStore();
    try {
      const photo = await store.addPhoto(
        {
          url: "",
          thumbUrl: "",
          uploaderName: item.uploaderName || "Guest",
          caption: item.caption,
          team: item.team,
          source: "guest",
          challengeId: item.challengeId,
          guestId: item.guestId,
        },
        store.kind === "local" ? medium : full,
        thumb,
      );
      if (store.kind === "local") await sleep(400);
      patch(item.id, { status: photo.status === "approved" ? "uploaded" : "pending", progress: 100 });
    } finally {
      clearInterval(ticker);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    const fatal = /HEIC|photo we can read|storage is full/i.test(message);
    const attempts = item.attempts + 1;
    if (fatal || attempts >= MAX_ATTEMPTS) {
      patch(item.id, { status: "error", error: message, attempts, progress: 0 });
    } else {
      const delay = Math.min(30_000, 1000 * 2 ** attempts);
      patch(item.id, { status: "failed", error: message, attempts, nextRetryAt: Date.now() + delay, progress: 0 });
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useUploads.setState({ online: true });
    void pump();
  });
  window.addEventListener("offline", () => useUploads.setState({ online: false }));
}
