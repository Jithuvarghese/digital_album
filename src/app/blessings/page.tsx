import type { Metadata } from "next";
import { BlessingsWall } from "@/components/blessings/blessings-wall";

export const metadata: Metadata = { title: "Blessings wall" };

export default function BlessingsPage() {
  return <BlessingsWall />;
}
