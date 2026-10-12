import type { DataStore } from "./store";
import { LocalStore } from "./local-store";
import { SupabaseStore } from "./supabase-store";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

let instance: DataStore | null = null;

/** Returns the active store: Supabase when configured, otherwise the in-browser demo store. */
export function getStore(): DataStore {
  if (!instance) instance = isSupabaseConfigured ? new SupabaseStore(url!, key!) : new LocalStore();
  return instance;
}

export type { DataStore } from "./store";
export * from "./types";
