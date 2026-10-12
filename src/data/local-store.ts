import { weddingConfig } from "@/config/wedding.config";
import { uid } from "@/lib/id";
import type { DataStore, ListOptions } from "./store";
import { buildSeed, defaultSettings, type SeedData } from "./seed";
import type { Collection, Guest, Photo, Settings } from "./types";

const KEY = "album-data-v1";
const CHANNEL = "album-data";

/**
 * Demo store: keeps everything in localStorage and syncs open tabs on the same
 * device with BroadcastChannel, so the live screen updates while you post from another tab.
 */
export class LocalStore implements DataStore {
  readonly kind = "local" as const;
  private data: SeedData;
  private listeners = new Set<(c: Collection) => void>();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.data = this.load();
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        this.channel = new BroadcastChannel(CHANNEL);
        this.channel.onmessage = (e: MessageEvent<Collection>) => {
          this.data = this.load();
          this.emit(e.data, false);
        };
      }
      // Fallback for browsers without BroadcastChannel
      window.addEventListener("storage", (e) => {
        if (e.key === KEY) {
          this.data = this.load();
          this.emit("settings", false);
          this.emit("photos", false);
          this.emit("blessings", false);
          this.emit("scores", false);
        }
      });
    }
  }

  private load(): SeedData {
    if (typeof window === "undefined") return buildSeed();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SeedData;
        parsed.settings = { ...defaultSettings(), ...parsed.settings };
        return parsed;
      }
    } catch {
      /* fall through to seed */
    }
    const seed = buildSeed();
    this.data = seed;
    this.persist();
    return seed;
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Storage full: drop full-size images of the oldest guest uploads, keep thumbnails.
      const uploads = this.data.photos.filter((p) => p.url.startsWith("data:")).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const p of uploads.slice(0, Math.max(1, Math.ceil(uploads.length / 3)))) p.url = p.thumbUrl;
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch {
        throw new Error("This device's storage is full. In the live version photos are stored online.");
      }
    }
  }

  private commit(collection: Collection) {
    this.persist();
    this.emit(collection, true);
  }

  private emit(collection: Collection, broadcast: boolean) {
    this.listeners.forEach((l) => l(collection));
    if (broadcast) this.channel?.postMessage(collection);
  }

  private filter<T extends { status: string; createdAt: string }>(items: T[], opts?: ListOptions): T[] {
    const list = opts?.status ? items.filter((i) => i.status === opts.status) : items;
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // Photos
  async listPhotos(opts?: ListOptions) {
    return this.filter(this.data.photos, opts);
  }
  async addPhoto(input: Parameters<DataStore["addPhoto"]>[0], file?: Blob, thumb?: Blob) {
    const url = file ? await blobToDataUrl(file) : input.url;
    const thumbUrl = thumb ? await blobToDataUrl(thumb) : input.thumbUrl || url;
    const photo: Photo = {
      ...input,
      url,
      thumbUrl,
      id: uid(),
      likes: 0,
      status: input.status ?? (this.data.settings.autoApprove ? "approved" : "pending"),
      createdAt: new Date().toISOString(),
    };
    this.data.photos.push(photo);
    this.commit("photos");
    return photo;
  }
  async likePhoto(id: string, delta: 1 | -1) {
    const p = this.data.photos.find((x) => x.id === id);
    if (p) p.likes = Math.max(0, p.likes + delta);
    this.commit("photos");
  }
  async updatePhoto(id: string, patch: Partial<Photo>) {
    const p = this.data.photos.find((x) => x.id === id);
    if (!p) return;
    const wasApproved = p.status === "approved";
    Object.assign(p, patch);
    // Approving a photo challenge awards its points
    if (!wasApproved && p.status === "approved" && p.challengeId && p.guestId && p.team) {
      const ch = weddingConfig.challenges.find((c) => c.id === p.challengeId);
      if (ch) this.pushScore({ guestId: p.guestId, team: p.team, source: "challenge", points: ch.points });
    }
    this.commit("photos");
  }
  async deletePhoto(id: string) {
    this.data.photos = this.data.photos.filter((x) => x.id !== id);
    this.commit("photos");
  }

  // Blessings
  async listBlessings(opts?: ListOptions) {
    return this.filter(this.data.blessings, opts);
  }
  async addBlessing(input: Parameters<DataStore["addBlessing"]>[0]) {
    const b = { ...input, id: uid(), status: this.data.settings.autoApprove ? ("approved" as const) : ("pending" as const), createdAt: new Date().toISOString() };
    this.data.blessings.push(b);
    this.commit("blessings");
    return b;
  }
  async updateBlessing(id: string, patch: Parameters<DataStore["updateBlessing"]>[1]) {
    const b = this.data.blessings.find((x) => x.id === id);
    if (b) Object.assign(b, patch);
    this.commit("blessings");
  }
  async deleteBlessing(id: string) {
    this.data.blessings = this.data.blessings.filter((x) => x.id !== id);
    this.commit("blessings");
  }

  // Guests and scores
  async listGuests(): Promise<Guest[]> {
    const totals = new Map<string, number>();
    for (const s of this.data.scores) totals.set(s.guestId, (totals.get(s.guestId) ?? 0) + s.points);
    return this.data.guests.map((g) => ({ ...g, points: totals.get(g.id) ?? 0 })).sort((a, b) => b.points - a.points);
  }
  async upsertGuest(guest: Pick<Guest, "id" | "displayName" | "team">) {
    const existing = this.data.guests.find((g) => g.id === guest.id);
    if (existing) {
      existing.displayName = guest.displayName;
      if (existing.team !== guest.team) {
        existing.team = guest.team;
        // Points follow the guest to the new team
        this.data.scores.filter((s) => s.guestId === guest.id).forEach((s) => (s.team = guest.team));
      }
    } else {
      this.data.guests.push({ ...guest, points: 0, createdAt: new Date().toISOString() });
    }
    this.commit("guests");
    return (await this.listGuests()).find((g) => g.id === guest.id)!;
  }
  async listScores() {
    return [...this.data.scores];
  }
  private pushScore(event: Parameters<DataStore["addScore"]>[0]) {
    const e = { ...event, id: uid(), createdAt: new Date().toISOString() };
    this.data.scores.push(e);
    return e;
  }
  async addScore(event: Parameters<DataStore["addScore"]>[0]) {
    if (this.data.settings.gameStatus === "ended") throw new Error("The game has ended.");
    const e = this.pushScore(event);
    this.commit("scores");
    return e;
  }
  async resetScores() {
    this.data.scores = [];
    this.data.votes = [];
    this.data.predictions.forEach((p) => (p.revealedAnswer = null));
    this.data.settings.gameStatus = "open";
    this.data.settings.winner = null;
    this.commit("scores");
    this.emit("settings", true);
  }

  // RSVPs
  async listRsvps() {
    return [...this.data.rsvps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async addRsvp(input: Parameters<DataStore["addRsvp"]>[0]) {
    const r = { ...input, id: uid(), createdAt: new Date().toISOString() };
    this.data.rsvps.push(r);
    this.commit("rsvps");
    return r;
  }

  // Capsule
  async countCapsule() {
    return this.data.capsule.length;
  }
  async listCapsule() {
    return [...this.data.capsule].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async addCapsule(input: Parameters<DataStore["addCapsule"]>[0]) {
    const c = { ...input, id: uid(), createdAt: new Date().toISOString() };
    this.data.capsule.push(c);
    this.commit("capsule");
    return c;
  }

  // Predictions
  async listPredictions() {
    return [...this.data.predictions];
  }
  async revealPrediction(id: string, answer: number | null) {
    const p = this.data.predictions.find((x) => x.id === id);
    if (!p) return;
    const before = p.revealedAnswer;
    p.revealedAnswer = answer;
    // Award points to correct guesses the first time an answer is revealed
    if (before === null && answer !== null) {
      for (const v of this.data.votes.filter((v) => v.predictionId === id && v.option === answer)) {
        this.pushScore({ guestId: v.guestId, team: v.team, source: "prediction", points: 15 });
      }
      this.emit("scores", true);
    }
    this.commit("predictions");
  }
  async listVotes() {
    return [...this.data.votes];
  }
  async vote(input: Parameters<DataStore["vote"]>[0]) {
    this.data.votes = this.data.votes.filter((v) => !(v.predictionId === input.predictionId && v.guestId === input.guestId));
    this.data.votes.push({ ...input, id: uid(), createdAt: new Date().toISOString() });
    this.commit("votes");
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return { ...this.data.settings, modulesEnabled: { ...this.data.settings.modulesEnabled } };
  }
  async updateSettings(patch: Partial<Settings>) {
    this.data.settings = { ...this.data.settings, ...patch };
    this.commit("settings");
  }
  async endGame(winner: Settings["winner"]) {
    this.data.settings.gameStatus = "ended";
    this.data.settings.winner = winner;
    this.commit("settings");
  }

  async verifyAdmin(passcode: string) {
    return passcode.trim() === weddingConfig.adminPasscode;
  }

  subscribe(listener: (c: Collection) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async reset() {
    this.data = buildSeed();
    this.persist();
    (["photos", "blessings", "guests", "scores", "rsvps", "capsule", "predictions", "votes", "settings"] as Collection[]).forEach((c) => this.emit(c, true));
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
