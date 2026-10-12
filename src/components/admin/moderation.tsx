"use client";

import { useState } from "react";
import { getStore } from "@/data";
import { useLive } from "@/data/hooks";
import type { Blessing, Photo, Status } from "@/data/types";
import { timeAgo } from "@/lib/text";
import { useUi } from "@/state/ui";
import { EmptyState, Tabs } from "@/components/ui/primitives";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

type Kind = "photos" | "blessings";

export function Moderation() {
  const toast = useUi((s) => s.showToast);
  const [kind, setKind] = useState<Kind>("photos");
  const [filter, setFilter] = useState<Status>("pending");
  const [selected, setSelected] = useState<string[]>([]);
  const photos = useLive<Photo[]>(["photos"], (s) => s.listPhotos(), []);
  const blessings = useLive<Blessing[]>(["blessings"], (s) => s.listBlessings(), []);

  const items = (kind === "photos" ? photos.data : blessings.data).filter((i) => i.status === filter);
  const pendingCount = { photos: photos.data.filter((p) => p.status === "pending").length, blessings: blessings.data.filter((b) => b.status === "pending").length };

  const setStatus = async (ids: string[], status: Status) => {
    const store = getStore();
    await Promise.all(ids.map((id) => (kind === "photos" ? store.updatePhoto(id, { status }) : store.updateBlessing(id, { status }))));
    setSelected([]);
    toast(`${ids.length} ${kind === "photos" ? "photo" : "blessing"}${ids.length > 1 ? "s" : ""} ${status === "approved" ? "approved" : status === "rejected" ? "hidden" : "moved back to waiting"}`);
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this permanently? This cannot be undone.")) return;
    const store = getStore();
    await (kind === "photos" ? store.deletePhoto(id) : store.deleteBlessing(id));
    toast("Deleted");
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-4">
      <Tabs
        label="What to review"
        value={kind}
        onChange={(v) => {
          setKind(v);
          setSelected([]);
        }}
        options={[
          { value: "photos", label: `Photos${pendingCount.photos ? ` (${pendingCount.photos} new)` : ""}` },
          { value: "blessings", label: `Blessings${pendingCount.blessings ? ` (${pendingCount.blessings} new)` : ""}` },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected"] as Status[]).map((s) => (
          <button key={s} onClick={() => { setFilter(s); setSelected([]); }} className={`btn-sm btn ${filter === s ? "bg-ink text-jasmine" : "bg-paper ring-1 ring-gold/40"}`}>
            {s === "pending" ? "Waiting for approval" : s === "approved" ? "Shown to guests" : "Hidden"}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-2xl bg-ivory/95 p-2 ring-1 ring-gold/30 backdrop-blur">
          <button className="btn-sm btn bg-paper ring-1 ring-gold/40" onClick={() => setSelected(selected.length === items.length ? [] : items.map((i) => i.id))}>
            {selected.length === items.length ? "Clear selection" : `Select all (${items.length})`}
          </button>
          {selected.length > 0 && (
            <>
              {filter !== "approved" && (
                <button className="btn-sm btn bg-leaf text-jasmine" onClick={() => setStatus(selected, "approved")}>
                  <CheckIcon size={16} /> Approve {selected.length}
                </button>
              )}
              {filter !== "rejected" && (
                <button className="btn-sm btn bg-maroon text-jasmine" onClick={() => setStatus(selected, "rejected")}>
                  <CloseIcon size={16} /> Hide {selected.length}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title={filter === "pending" ? "All caught up!" : "Nothing here"} body={filter === "pending" ? "New photos and blessings from guests will appear here for you to approve." : undefined} />
      ) : kind === "photos" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(items as Photo[]).map((p) => (
            <li key={p.id} className={`card overflow-hidden ${selected.includes(p.id) ? "ring-2 ring-maroon" : ""}`}>
              <label className="relative block cursor-pointer">
                <input type="checkbox" className="absolute left-2 top-2 h-6 w-6 accent-[rgb(var(--c-maroon))]" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} aria-label={`Select photo by ${p.uploaderName}`} />
                <img src={p.thumbUrl} alt={p.caption || "Guest photo"} className="aspect-square w-full object-cover" loading="lazy" />
              </label>
              <div className="p-2.5 text-xs">
                <p className="truncate font-semibold">{p.uploaderName}</p>
                <p className="truncate text-muted">{p.caption || "No caption"} · {timeAgo(p.createdAt)}</p>
                {p.challengeId && <p className="mt-0.5 text-maroon">Challenge entry</p>}
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {p.status !== "approved" && (
                    <button className="btn-sm btn bg-leaf px-0 text-jasmine" onClick={() => setStatus([p.id], "approved")} aria-label="Approve">
                      <CheckIcon size={16} />
                    </button>
                  )}
                  {p.status !== "rejected" && (
                    <button className="btn-sm btn bg-maroon px-0 text-jasmine" onClick={() => setStatus([p.id], "rejected")} aria-label="Hide">
                      <CloseIcon size={16} />
                    </button>
                  )}
                  <button className="btn-sm btn bg-paper px-0 text-maroon ring-1 ring-maroon/30" onClick={() => remove(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {(items as Blessing[]).map((b) => (
            <li key={b.id} className={`card flex gap-3 p-4 ${selected.includes(b.id) ? "ring-2 ring-maroon" : ""}`}>
              <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-[rgb(var(--c-maroon))]" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} aria-label={`Select blessing from ${b.name}`} />
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line">{b.message}</p>
                <p className="mt-1 text-sm text-muted">
                  <span className="font-semibold text-maroon">{b.name}</span> {b.relation && `· ${b.relation}`} · {timeAgo(b.createdAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status !== "approved" && (
                    <button className="btn-sm btn bg-leaf text-jasmine" onClick={() => setStatus([b.id], "approved")}>
                      <CheckIcon size={16} /> Approve
                    </button>
                  )}
                  {b.status !== "rejected" && (
                    <button className="btn-sm btn bg-maroon text-jasmine" onClick={() => setStatus([b.id], "rejected")}>
                      <CloseIcon size={16} /> Hide
                    </button>
                  )}
                  <button className="btn-sm btn-ghost" onClick={() => remove(b.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
