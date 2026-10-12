import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { uid } from "@/lib/id";
import type { DataStore, ListOptions } from "./store";
import { defaultSettings } from "./seed";
import { toCamel, toSnake } from "./case";
import type { Blessing, CapsuleMessage, Collection, Guest, Photo, Prediction, PredictionVote, Rsvp, ScoreEvent, Settings } from "./types";

const tableToCollection: Record<string, Collection> = {
  photos: "photos",
  blessings: "blessings",
  guests: "guests",
  scores: "scores",
  rsvps: "rsvps",
  capsule_messages: "capsule",
  predictions: "predictions",
  prediction_votes: "votes",
  settings: "settings",
};

const ADMIN_KEY = "album-admin-pass";

/**
 * Shared store backed by Supabase. Public reads and guest writes go straight to
 * Supabase (guarded by row-level security). Moderation and other admin actions go
 * through /api/admin so the passcode and service key never reach the browser bundle.
 */
export class SupabaseStore implements DataStore {
  readonly kind = "supabase" as const;
  private db: SupabaseClient;
  private listeners = new Set<(c: Collection) => void>();
  private subscribed = false;

  constructor(url: string, anonKey: string) {
    this.db = createClient(url, anonKey, { auth: { persistSession: false } });
  }

  private ensureRealtime() {
    if (this.subscribed || typeof window === "undefined") return;
    this.subscribed = true;
    this.db
      .channel("album")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        const c = tableToCollection[payload.table];
        if (c) this.listeners.forEach((l) => l(c));
      })
      .subscribe();
  }

  private emit(c: Collection) {
    this.listeners.forEach((l) => l(c));
  }

  private async admin<T = unknown>(op: string, body: Record<string, unknown> = {}): Promise<T> {
    const passcode = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_KEY) ?? "" : "";
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op, passcode, ...body }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Admin request failed");
    return (await res.json()).data as T;
  }

  private async rows<T>(query: PromiseLike<{ data: unknown[] | null; error: unknown }>): Promise<T[]> {
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r) => toCamel<T>(r as Record<string, unknown>));
  }

  // Photos
  async listPhotos(opts?: ListOptions) {
    if (opts?.status !== "approved") {
      const rows = await this.admin<Record<string, unknown>[]>("list", { table: "photos" });
      return rows.map((r) => toCamel<Photo>(r)).filter((p) => !opts?.status || p.status === opts.status);
    }
    return this.rows<Photo>(this.db.from("photos").select("*").eq("status", "approved").order("created_at", { ascending: false }));
  }
  async addPhoto(input: Parameters<DataStore["addPhoto"]>[0], file?: Blob, thumb?: Blob) {
    const id = uid();
    let url = input.url;
    let thumbUrl = input.thumbUrl;
    if (file) url = await this.upload(`${id}.jpg`, file);
    if (thumb) thumbUrl = await this.upload(`${id}-thumb.jpg`, thumb);
    // Status is decided by a database trigger (pending unless auto-approve is on)
    const row = toSnake({ ...input, id, url, thumbUrl: thumbUrl || url, status: undefined });
    const { error } = await this.db.from("photos").insert(row);
    if (error) throw error;
    return { ...input, id, url, thumbUrl: thumbUrl || url, likes: 0, status: "pending", createdAt: new Date().toISOString() } as Photo;
  }
  private async upload(path: string, blob: Blob) {
    const { error } = await this.db.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    return this.db.storage.from("photos").getPublicUrl(path).data.publicUrl;
  }
  async likePhoto(id: string, delta: 1 | -1) {
    const { error } = await this.db.rpc("like_photo", { p_id: id, p_delta: delta });
    if (error) throw error;
  }
  async updatePhoto(id: string, patch: Partial<Photo>) {
    await this.admin("update", { table: "photos", id, patch: toSnake(patch) });
    this.emit("photos");
  }
  async deletePhoto(id: string) {
    await this.admin("delete", { table: "photos", id });
    this.emit("photos");
  }

  // Blessings
  async listBlessings(opts?: ListOptions) {
    if (opts?.status !== "approved") {
      const rows = await this.admin<Record<string, unknown>[]>("list", { table: "blessings" });
      return rows.map((r) => toCamel<Blessing>(r)).filter((b) => !opts?.status || b.status === opts.status);
    }
    return this.rows<Blessing>(this.db.from("blessings").select("*").eq("status", "approved").order("created_at", { ascending: false }));
  }
  async addBlessing(input: Parameters<DataStore["addBlessing"]>[0]) {
    const id = uid();
    const { error } = await this.db.from("blessings").insert(toSnake({ ...input, id }));
    if (error) throw error;
    return { ...input, id, status: "pending", createdAt: new Date().toISOString() } as Blessing;
  }
  async updateBlessing(id: string, patch: Partial<Blessing>) {
    await this.admin("update", { table: "blessings", id, patch: toSnake(patch) });
    this.emit("blessings");
  }
  async deleteBlessing(id: string) {
    await this.admin("delete", { table: "blessings", id });
    this.emit("blessings");
  }

  // Guests and scores
  async listGuests(): Promise<Guest[]> {
    const [guests, scores] = await Promise.all([this.rows<Guest>(this.db.from("guests").select("*")), this.listScores()]);
    const totals = new Map<string, number>();
    for (const s of scores) totals.set(s.guestId, (totals.get(s.guestId) ?? 0) + s.points);
    return guests.map((g) => ({ ...g, points: totals.get(g.id) ?? 0 })).sort((a, b) => b.points - a.points);
  }
  async upsertGuest(guest: Pick<Guest, "id" | "displayName" | "team">) {
    const { error } = await this.db.from("guests").upsert(toSnake(guest));
    if (error) throw error;
    return { ...guest, points: 0, createdAt: new Date().toISOString() };
  }
  async listScores() {
    return this.rows<ScoreEvent>(this.db.from("scores").select("*"));
  }
  async addScore(event: Parameters<DataStore["addScore"]>[0]) {
    const row = { ...event, id: uid() };
    const { error } = await this.db.from("scores").insert(toSnake(row));
    if (error) throw error;
    return { ...row, createdAt: new Date().toISOString() };
  }
  async resetScores() {
    await this.admin("resetScores");
    this.emit("scores");
  }

  // RSVPs
  async listRsvps() {
    const rows = await this.admin<Record<string, unknown>[]>("list", { table: "rsvps" });
    return rows.map((r) => toCamel<Rsvp>(r));
  }
  async addRsvp(input: Parameters<DataStore["addRsvp"]>[0]) {
    const row = { ...input, id: uid() };
    const { error } = await this.db.from("rsvps").insert(toSnake(row));
    if (error) throw error;
    return { ...row, createdAt: new Date().toISOString() };
  }

  // Capsule
  async countCapsule() {
    const { data, error } = await this.db.rpc("capsule_count");
    if (error) throw error;
    return Number(data ?? 0);
  }
  async listCapsule() {
    const rows = await this.admin<Record<string, unknown>[]>("list", { table: "capsule_messages" });
    return rows.map((r) => toCamel<CapsuleMessage>(r));
  }
  async addCapsule(input: Parameters<DataStore["addCapsule"]>[0]) {
    const row = { ...input, id: uid() };
    const { error } = await this.db.from("capsule_messages").insert(toSnake(row));
    if (error) throw error;
    return { ...row, createdAt: new Date().toISOString() };
  }

  // Predictions
  async listPredictions() {
    return this.rows<Prediction>(this.db.from("predictions").select("*").order("sort_order"));
  }
  async revealPrediction(id: string, answer: number | null) {
    await this.admin("reveal", { id, answer });
    this.emit("predictions");
  }
  async listVotes() {
    return this.rows<PredictionVote>(this.db.from("prediction_votes").select("*"));
  }
  async vote(input: Parameters<DataStore["vote"]>[0]) {
    const { error } = await this.db.from("prediction_votes").upsert(toSnake({ ...input, id: uid() }), { onConflict: "prediction_id,guest_id" });
    if (error) throw error;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const { data } = await this.db.from("settings").select("*").eq("id", 1).maybeSingle();
    return { ...defaultSettings(), ...(data ? toCamel<Partial<Settings>>(data) : {}) };
  }
  async updateSettings(patch: Partial<Settings>) {
    await this.admin("settings", { patch: toSnake(patch) });
    this.emit("settings");
  }
  async endGame(winner: Settings["winner"]) {
    await this.admin("settings", { patch: { game_status: "ended", winner } });
    this.emit("settings");
  }

  async verifyAdmin(passcode: string) {
    sessionStorage.setItem(ADMIN_KEY, passcode);
    try {
      await this.admin("verify");
      return true;
    } catch {
      sessionStorage.removeItem(ADMIN_KEY);
      return false;
    }
  }

  subscribe(listener: (c: Collection) => void) {
    this.ensureRealtime();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async reset() {
    throw new Error("Resetting data is only available in demo mode.");
  }
}
