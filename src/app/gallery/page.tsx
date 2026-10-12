import { Suspense } from "react";
import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/gallery-view";

export const metadata: Metadata = { title: "Photo gallery" };

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryView />
    </Suspense>
  );
}
