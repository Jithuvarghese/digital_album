import type { ModuleKey, Phase, Side, ThemeName } from "@/config/wedding.config";

export type Team = Side;
export type Status = "pending" | "approved" | "rejected";

export interface Photo {
  id: string;
  url: string;
  thumbUrl: string;
  uploaderName: string;
  caption: string;
  team: Team | null;
  status: Status;
  likes: number;
  source: "couple" | "guest";
  challengeId?: string | null;
  guestId?: string | null;
  createdAt: string;
}

export type BlessingStyle = "floral" | "gold" | "simple";

export interface Blessing {
  id: string;
  name: string;
  relation: string;
  message: string;
  style: BlessingStyle;
  status: Status;
  createdAt: string;
}

export interface Guest {
  id: string;
  displayName: string;
  team: Team;
  points: number;
  createdAt: string;
}

export type ScoreSource = "quiz" | "challenge" | "prediction" | "match" | "bonus";

export interface ScoreEvent {
  id: string;
  guestId: string;
  team: Team;
  source: ScoreSource;
  points: number;
  createdAt: string;
}

export interface Rsvp {
  id: string;
  name: string;
  attending: boolean;
  guestCount: number;
  side: Side | "both";
  meal: "veg" | "non-veg" | "jain" | "kids";
  note: string;
  createdAt: string;
}

export interface CapsuleMessage {
  id: string;
  name: string;
  message: string;
  unlockAt: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  question: string;
  options: string[];
  revealedAnswer: number | null;
}

export interface PredictionVote {
  id: string;
  predictionId: string;
  guestId: string;
  team: Team;
  option: number;
  createdAt: string;
}

export interface Settings {
  phase: Phase | "auto";
  theme: ThemeName;
  autoApprove: boolean;
  modulesEnabled: Record<ModuleKey, boolean>;
  gameStatus: "open" | "ended";
  winner: Team | null;
}

export interface TeamTotals {
  bride: number;
  groom: number;
}

export type Collection = "photos" | "blessings" | "guests" | "scores" | "rsvps" | "capsule" | "predictions" | "votes" | "settings";

export type NewPhoto = Omit<Photo, "id" | "createdAt" | "likes" | "status"> & { status?: Status };
export type NewBlessing = Omit<Blessing, "id" | "createdAt" | "status">;
