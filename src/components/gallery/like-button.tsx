"use client";

import { motion } from "framer-motion";
import { getStore } from "@/data";
import type { Photo } from "@/data/types";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { HeartIcon } from "@/components/ui/icons";

export function LikeButton({ photo, dark = false }: { photo: Photo; dark?: boolean }) {
  const t = useT();
  const liked = useDevice((s) => s.likedPhotos.includes(photo.id));
  const toggleLike = useDevice((s) => s.toggleLike);
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowLiked = toggleLike(photo.id);
    void getStore().likePhoto(photo.id, nowLiked ? 1 : -1);
  };
  return (
    <button
      onClick={onClick}
      aria-pressed={liked}
      aria-label={`${t("gallery.like")} (${photo.likes})`}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-full px-2 text-sm font-semibold ${dark ? "text-jasmine hover:bg-white/10" : "bg-paper/90 text-maroon shadow-sm"}`}
    >
      <motion.span key={String(liked)} initial={{ scale: liked ? 1.5 : 1 }} animate={{ scale: 1 }} className={liked ? "text-bride" : ""}>
        <HeartIcon size={18} filled={liked} />
      </motion.span>
      <span className="tabular-nums">{photo.likes}</span>
    </button>
  );
}
