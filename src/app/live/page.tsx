import { Suspense } from "react";
import type { Metadata } from "next";
import { LiveScreen } from "@/components/live/live-screen";

export const metadata: Metadata = { title: "Live screen", robots: { index: false } };

export default function LivePage() {
  return (
    <Suspense>
      <LiveScreen />
    </Suspense>
  );
}
