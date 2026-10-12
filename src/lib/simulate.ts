"use client";

import { create } from "zustand";
import { getStore } from "@/data";

/** Adds believable guest activity every few seconds, so the live screen moves during a demo. */

const names = ["Ammu", "Kiran", "Deepa aunty", "Suresh mama", "Nila", "Varun", "Gayathri", "Hari", "Pooja", "Manu", "Shalini", "Abhi"];
const relations = ["Anjali's cousin", "Karthik's colleague", "Family friend from Coimbatore", "Neighbour from Kochi", "College friend", "Karthik's cricket team"];
const blessings = [
  "May your home always smell of filter coffee and fresh jasmine.",
  "Wishing you a lifetime of rainy evenings and shared umbrellas!",
  "So happy for you both. The sadya was 10/10, the couple 11/10.",
  "Two families, one big happy chaos. Congratulations!",
  "May every anniversary be as beautiful as today.",
  "ഇരുവർക്കും എല്ലാ നന്മകളും നേരുന്നു!",
  "இனிய திருமண வாழ்த்துகள்! நீடூழி வாழ்க!",
];
const captions = ["Look at this mandapam!", "Ammamma stole the show", "Cousins assemble", "Payasam round three", "The garland moment", "Dance floor is ON", "Best seat in the house", ""];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

async function tick() {
  const store = getStore();
  const roll = Math.random();
  try {
    if (roll < 0.4) {
      const n = String(Math.floor(Math.random() * 24) + 1).padStart(2, "0");
      const url = `/demo/photos/p${n}.svg`;
      await store.addPhoto({ url, thumbUrl: url, uploaderName: pick(names), caption: pick(captions), team: Math.random() < 0.5 ? "bride" : "groom", source: "guest", status: "approved" });
    } else if (roll < 0.6) {
      const b = await store.addBlessing({ name: pick(names), relation: pick(relations), message: pick(blessings), style: pick(["floral", "gold", "simple"] as const) });
      await store.updateBlessing(b.id, { status: "approved" });
    } else {
      const guests = await store.listGuests();
      const g = pick(guests);
      if (g) await store.addScore({ guestId: g.id, team: g.team, source: "bonus", points: pick([5, 10, 10, 15, 20]) });
    }
  } catch {
    /* game ended or storage full: skip this tick */
  }
}

let timer: ReturnType<typeof setInterval> | undefined;

export const useSimulation = create<{ running: boolean; toggle: () => void; stop: () => void }>((set, get) => ({
  running: false,
  toggle: () => {
    if (get().running) return get().stop();
    void tick();
    timer = setInterval(() => void tick(), 3500);
    set({ running: true });
  },
  stop: () => {
    clearInterval(timer);
    set({ running: false });
  },
}));
