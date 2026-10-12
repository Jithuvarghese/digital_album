import type { Metadata } from "next";
import { PlayView } from "@/components/game/play-view";

export const metadata: Metadata = { title: "Bride vs Groom" };

export default function PlayPage() {
  return <PlayView />;
}
