"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useLive } from "@/data/hooks";
import type { Photo } from "@/data/types";
import { useT } from "@/state/ui";
import { EmptyState, ErrorState, Section, SectionHeader, Skeleton, Tabs } from "@/components/ui/primitives";
import { CameraIcon } from "@/components/ui/icons";
import { LikeButton } from "./like-button";
import { Lightbox } from "./lightbox";

type Tab = "couple" | "guests";
const PAGE = 18;

export function GalleryView() {
  const t = useT();
  const params = useSearchParams();
  const router = useRouter();
  const { data, loading, error, reload } = useLive<Photo[]>(["photos"], (s) => s.listPhotos({ status: "approved" }), []);
  const [tab, setTab] = useState<Tab>(params.get("tab") === "couple" ? "couple" : "guests");
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => data.filter((p) => (tab === "couple" ? p.source === "couple" : p.source === "guest")), [data, tab]);
  const favourites = useMemo(() => [...data].sort((a, b) => b.likes - a.likes).slice(0, 8), [data]);

  // Deep link: /gallery?photo=<id>
  useEffect(() => {
    const id = params.get("photo");
    if (!id || !data.length) return;
    const p = data.find((x) => x.id === id);
    if (!p) return;
    const nextTab: Tab = p.source === "couple" ? "couple" : "guests";
    setTab(nextTab);
    const idx = data.filter((x) => (nextTab === "couple" ? x.source === "couple" : x.source === "guest")).findIndex((x) => x.id === id);
    setOpen(idx);
  }, [params, data]);

  const close = () => {
    setOpen(null);
    if (params.get("photo")) router.replace("/gallery", { scroll: false });
  };

  return (
    <Section className="pt-6">
      <div className="container-wide">
        <SectionHeader title={t("gallery.title")} />

        {favourites.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-maroon">♥ {t("gallery.favourites")}</h2>
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              {favourites.map((p) => (
                <li key={p.id} className="relative w-28 shrink-0">
                  <Link href={`/gallery?photo=${p.id}`} scroll={false} className="block overflow-hidden rounded-xl ring-2 ring-gold/50">
                    <img src={p.thumbUrl} alt={p.caption || "Favourite photo"} loading="lazy" className="aspect-square w-full object-cover" />
                  </Link>
                  <span className="absolute bottom-1 right-1 rounded-full bg-ink/70 px-2 py-0.5 text-[11px] font-semibold text-jasmine">♥ {p.likes}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Tabs
          label={t("gallery.title")}
          value={tab}
          onChange={(v) => {
            setTab(v);
            setLimit(PAGE);
          }}
          options={[
            { value: "couple", label: t("gallery.couple") },
            { value: "guests", label: t("gallery.guests") },
          ]}
        />

        <div className="mt-6">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="masonry">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className={i % 3 ? "h-56" : "h-72"} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              title={t("gallery.empty")}
              action={
                <Link href="/upload" className="btn-primary">
                  <CameraIcon size={18} /> {t("qa.upload")}
                </Link>
              }
            />
          ) : (
            <>
              <ul className="masonry">
                {list.slice(0, limit).map((p, i) => (
                  <motion.li key={p.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group relative">
                    <button onClick={() => setOpen(i)} className="block w-full overflow-hidden rounded-2xl shadow-card ring-1 ring-gold/20" aria-label={`Open ${p.caption || "photo"} by ${p.uploaderName}`}>
                      <img src={p.thumbUrl} alt={p.caption || `Photo by ${p.uploaderName}`} loading="lazy" decoding="async" className="w-full transition duration-500 group-hover:scale-[1.03]" />
                    </button>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between rounded-b-2xl bg-gradient-to-t from-black/55 to-transparent p-2 pt-8">
                      <span className="truncate text-xs font-medium text-white">{p.uploaderName}</span>
                    </div>
                    <div className="absolute right-2 top-2">
                      <LikeButton photo={p} />
                    </div>
                  </motion.li>
                ))}
              </ul>
              {list.length > limit && (
                <div className="mt-6 text-center">
                  <button className="btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
                    {t("blessings.more")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Lightbox photos={list} index={open} onIndex={setOpen} onClose={close} />
    </Section>
  );
}
