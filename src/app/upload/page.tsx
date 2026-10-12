import { Suspense } from "react";
import type { Metadata } from "next";
import { UploadView } from "@/components/gallery/upload-view";

export const metadata: Metadata = { title: "Share your photos" };

export default function UploadPage() {
  return (
    <Suspense>
      <UploadView />
    </Suspense>
  );
}
