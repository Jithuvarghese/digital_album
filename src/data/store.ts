import type {
  Blessing,
  CapsuleMessage,
  Collection,
  Guest,
  NewBlessing,
  NewPhoto,
  Photo,
  Prediction,
  PredictionVote,
  Rsvp,
  ScoreEvent,
  Settings,
  Status,
  Team,
} from "./types";

export interface ListOptions {
  /** Only return items with this status. Public pages always pass "approved". */
  status?: Status;
}

/**
 * Storage contract shared by the browser demo store and the Supabase store.
 * Methods marked "admin" require the passcode to have been verified first.
 */
export interface DataStore {
  readonly kind: "local" | "supabase";

  // Photos
  listPhotos(opts?: ListOptions): Promise<Photo[]>;
  addPhoto(input: NewPhoto, file?: Blob, thumb?: Blob): Promise<Photo>;
  likePhoto(id: string, delta: 1 | -1): Promise<void>;
  updatePhoto(id: string, patch: Partial<Photo>): Promise<void>; // admin
  deletePhoto(id: string): Promise<void>; // admin

  // Blessings
  listBlessings(opts?: ListOptions): Promise<Blessing[]>;
  addBlessing(input: NewBlessing): Promise<Blessing>;
  updateBlessing(id: string, patch: Partial<Blessing>): Promise<void>; // admin
  deleteBlessing(id: string): Promise<void>; // admin

  // Guests and scores
  listGuests(): Promise<Guest[]>;
  upsertGuest(guest: Pick<Guest, "id" | "displayName" | "team">): Promise<Guest>;
  listScores(): Promise<ScoreEvent[]>;
  addScore(event: Omit<ScoreEvent, "id" | "createdAt">): Promise<ScoreEvent>;
  resetScores(): Promise<void>; // admin

  // RSVPs
  listRsvps(): Promise<Rsvp[]>; // admin
  addRsvp(input: Omit<Rsvp, "id" | "createdAt">): Promise<Rsvp>;

  // Time capsule
  countCapsule(): Promise<number>;
  listCapsule(): Promise<CapsuleMessage[]>; // admin
  addCapsule(input: Omit<CapsuleMessage, "id" | "createdAt">): Promise<CapsuleMessage>;

  // Predictions
  listPredictions(): Promise<Prediction[]>;
  revealPrediction(id: string, answer: number | null): Promise<void>; // admin
  listVotes(): Promise<PredictionVote[]>;
  vote(input: Omit<PredictionVote, "id" | "createdAt">): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<void>; // admin
  endGame(winner: Team | null): Promise<void>; // admin

  // Admin access
  verifyAdmin(passcode: string): Promise<boolean>;

  /** Called whenever a collection changes, in this tab or another device/tab. */
  subscribe(listener: (collection: Collection) => void): () => void;

  /** Restore the sample data (demo only). */
  reset(): Promise<void>;
}
