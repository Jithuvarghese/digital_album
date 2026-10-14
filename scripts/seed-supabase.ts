/**
 * Loads the sample wedding data into Supabase so a connected site looks lived-in.
 *
 *   npm run seed:supabase            add / refresh the sample data
 *   npm run seed:supabase -- --clear remove ALL photos, blessings, guests, scores, votes, RSVPs and capsule messages
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local or .env.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { buildSeed } from "../src/data/seed";
import { toSnake } from "../src/data/case";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

/** Stable UUID from a seed id, so re-running updates rows instead of duplicating them. */
function uuidFrom(id: string) {
  const h = createHash("sha1").update(`our-story-live:${id}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function upsert(table: string, rows: object[], onConflict = "id") {
  if (!rows.length) return;
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  console.log(`  ${table.padEnd(18)} ${rows.length} rows`);
}

async function clearTable(table: string) {
  const res = await fetch(`${url}/rest/v1/${table}?id=not.is.null`, { method: "DELETE", headers: { ...headers, Prefer: "return=minimal" } });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  console.log(`  cleared ${table}`);
}

async function main() {
  if (process.argv.includes("--clear")) {
    console.log("Removing all guest content…");
    for (const t of ["prediction_votes", "scores", "photos", "blessings", "guests", "rsvps", "capsule_messages"]) await clearTable(t);
    await fetch(`${url}/rest/v1/predictions?id=not.is.null`, { method: "PATCH", headers, body: JSON.stringify({ revealed_answer: null }) });
    await fetch(`${url}/rest/v1/settings?id=eq.1`, { method: "PATCH", headers, body: JSON.stringify({ game_status: "open", winner: null }) });
    console.log("Done. The site is now empty and ready for the real wedding.");
    return;
  }

  const seed = buildSeed();
  const id = (s: string) => uuidFrom(s);
  console.log("Loading sample data…");

  await upsert("guests", seed.guests.map((g) => toSnake({ ...g, id: id(g.id), points: 0 })));
  await upsert("photos", seed.photos.map((p) => toSnake({ ...p, id: id(p.id), guestId: null, challengeId: null })));
  await upsert("blessings", seed.blessings.map((b) => toSnake({ ...b, id: id(b.id) })));
  await upsert("scores", seed.scores.map((s) => toSnake({ ...s, id: id(s.id), guestId: id(s.guestId) })));
  await upsert("rsvps", seed.rsvps.map((r) => toSnake({ ...r, id: id(r.id) })));
  await upsert("capsule_messages", seed.capsule.map((c) => toSnake({ ...c, id: id(c.id) })));
  await upsert(
    "predictions",
    seed.predictions.map((p, i) => ({ id: p.id, question: p.question, options: p.options, sort_order: i + 1 })),
  );
  await upsert("prediction_votes", seed.votes.map((v) => toSnake({ ...v, id: id(v.id), guestId: id(v.guestId) })), "prediction_id,guest_id");
  console.log("Done. Open the site to see it.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
