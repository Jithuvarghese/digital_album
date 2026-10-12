import type { DataStore } from "./store";
import { LocalStore } from "./local-store";

export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let instance: DataStore | null = null;

/** Returns the active store: Supabase when configured, otherwise the in-browser demo store. */
export function getStore(): DataStore {
  if (instance) return instance;
  // The env check is inlined at build time, so the Supabase client is only bundled when it is configured.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseStore } = require("./supabase-store") as typeof import("./supabase-store");
    instance = new SupabaseStore(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  } else {
    instance = new LocalStore();
  }
  return instance;
}

export type { DataStore } from "./store";
export * from "./types";
