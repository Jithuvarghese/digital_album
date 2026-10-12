import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { weddingConfig } from "@/config/wedding.config";

/**
 * Admin actions for Supabase mode. The passcode (ADMIN_PASSCODE) and the
 * service role key stay on the server; the browser only sends the passcode typed by the user.
 */

export const dynamic = "force-dynamic";

const TABLES = new Set(["photos", "blessings", "rsvps", "capsule_messages"]);
const EDITABLE: Record<string, string[]> = {
  photos: ["status", "caption", "team"],
  blessings: ["status", "message", "relation", "name"],
};
const SETTINGS_FIELDS = ["phase", "theme", "auto_approve", "modules_enabled", "game_status", "winner"];

const attempts = new Map<string, { count: number; until: number }>();

function passcodeOk(given: unknown) {
  const expected = process.env.ADMIN_PASSCODE ?? "";
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function pick(obj: Record<string, unknown> | undefined, keys: string[]) {
  return Object.fromEntries(Object.entries(obj ?? {}).filter(([k]) => keys.includes(k)));
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Admin is not configured on the server." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const lock = attempts.get(ip);
  if (lock && lock.until > Date.now()) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!passcodeOk(body.passcode)) {
    const count = (lock?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= 5 ? Date.now() + 60_000 : 0 });
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }
  attempts.delete(ip);

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const table = String(body.table ?? "");
  const id = String(body.id ?? "");

  try {
    switch (body.op) {
      case "verify":
        return NextResponse.json({ data: true });

      case "list": {
        if (!TABLES.has(table)) throw new Error("Unknown table");
        const { data, error } = await db.from(table).select("*").order("created_at", { ascending: false }).limit(2000);
        if (error) throw error;
        return NextResponse.json({ data });
      }

      case "update": {
        if (!EDITABLE[table]) throw new Error("Not editable");
        const patch = pick(body.patch as Record<string, unknown>, EDITABLE[table]);
        const { data: before } = await db.from(table).select("*").eq("id", id).single();
        const { error } = await db.from(table).update(patch).eq("id", id);
        if (error) throw error;
        // Approving a challenge photo awards the challenge points
        if (table === "photos" && before && before.status !== "approved" && patch.status === "approved" && before.challenge_id && before.guest_id && before.team) {
          const ch = weddingConfig.challenges.find((c) => c.id === before.challenge_id);
          if (ch) await db.from("scores").insert({ guest_id: before.guest_id, team: before.team, source: "challenge", points: ch.points });
        }
        return NextResponse.json({ data: true });
      }

      case "delete": {
        if (!EDITABLE[table]) throw new Error("Not deletable");
        const { error } = await db.from(table).delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      case "settings": {
        const patch = { ...pick(body.patch as Record<string, unknown>, SETTINGS_FIELDS), updated_at: new Date().toISOString() };
        const { error } = await db.from("settings").update(patch).eq("id", 1);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      case "reveal": {
        const answer = body.answer === null ? null : Number(body.answer);
        const { data: pred } = await db.from("predictions").select("revealed_answer").eq("id", id).single();
        const { error } = await db.from("predictions").update({ revealed_answer: answer }).eq("id", id);
        if (error) throw error;
        if (pred && pred.revealed_answer === null && answer !== null) {
          const { data: votes } = await db.from("prediction_votes").select("guest_id, team").eq("prediction_id", id).eq("option", answer);
          if (votes?.length) await db.from("scores").insert(votes.map((v) => ({ guest_id: v.guest_id, team: v.team, source: "prediction", points: 15 })));
        }
        return NextResponse.json({ data: true });
      }

      case "resetScores": {
        await db.from("scores").delete().not("id", "is", null);
        await db.from("prediction_votes").delete().not("id", "is", null);
        await db.from("predictions").update({ revealed_answer: null }).not("id", "is", null);
        await db.from("settings").update({ game_status: "open", winner: null }).eq("id", 1);
        return NextResponse.json({ data: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 400 });
  }
}
