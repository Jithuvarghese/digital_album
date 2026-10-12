"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import type { Photo } from "@/data/types";
import { timeAgo } from "@/lib/text";
import { useT } from "@/state/ui";
import { ChevronLeft, ChevronRight, CloseIcon, DownloadIcon } from "@/components/ui/icons";
import { LikeButton } from "./like-button";

export function Lightbox({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const t = useT();
  const photo = index !== null ? photos[index] : null;
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null || !photos.length) return;
      onIndex((index + dir + photos.length) % photos.length);
    },
    [index, photos.length, onIndex],
  );

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, go, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
    else if (info.offset.y > 120) onClose();
  };

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption || "Photo"}
          className="fixed inset-0 z-[80] flex flex-col bg-[#120b09]/95 text-jasmine"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between gap-2 p-3">
            <p className="text-sm text-jasmine/70">
              {index! + 1} / {photos.length}
            </p>
            <div className="flex items-center gap-1">
              <LikeButton photo={photo} dark />
              <a
                href={photo.url}
                download={`karthik-anjali-${photo.id.slice(0, 8)}.${photo.url.startsWith("data:image/svg") || photo.url.endsWith(".svg") ? "svg" : "jpg"}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
                aria-label={t("gallery.download")}
              >
                <DownloadIcon />
              </a>
              <button ref={closeRef} onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close">
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={photo.id}
                src={photo.url}
                alt={photo.caption || `Photo by ${photo.uploaderName}`}
                className="max-h-full max-w-full select-none rounded-lg object-contain"
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                draggable={false}
              />
            </AnimatePresence>
            <button onClick={() => go(-1)} className="absolute left-2 hidden h-12 w-12 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 sm:inline-flex" aria-label="Previous photo">
              <ChevronLeft />
            </button>
            <button onClick={() => go(1)} className="absolute right-2 hidden h-12 w-12 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 sm:inline-flex" aria-label="Next photo">
              <ChevronRight />
            </button>
          </div>
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
            {photo.caption && <p className="font-serif text-xl">{photo.caption}</p>}
            <p className="text-sm text-jasmine/70">
              {photo.uploaderName} · {timeAgo(photo.createdAt)}
              {photo.team && ` · Team ${photo.team === "bride" ? "Bride" : "Groom"}`}
            </p>
            <p className="mt-1 text-xs text-jasmine/40 sm:hidden">Swipe left or right · swipe down to close</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
