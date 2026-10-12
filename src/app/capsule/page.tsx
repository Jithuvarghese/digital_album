import type { Metadata } from "next";
import { CapsuleView } from "@/components/capsule/capsule-view";

export const metadata: Metadata = { title: "Time capsule" };

export default function CapsulePage() {
  return <CapsuleView />;
}
