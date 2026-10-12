import type { WeddingEvent } from "@/config/wedding.config";
import { coupleTitle } from "./site";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

/** Builds an .ics calendar file for one or more events. */
export function buildIcs(events: Array<Pick<WeddingEvent, "id" | "start" | "end" | "venue" | "address"> & { title: string; description: string }>) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Our Story Live//Wedding//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@our-story-live`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(e.end)}`,
      `SUMMARY:${esc(`${e.title} · ${coupleTitle}`)}`,
      `LOCATION:${esc(`${e.venue}, ${e.address}`)}`,
      `DESCRIPTION:${esc(e.description)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(e.title)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadFile(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
