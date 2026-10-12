import type { Metadata } from "next";
import { MemoryBook } from "@/components/memory/memory-book";

export const metadata: Metadata = { title: "Memory book" };

export default function MemoryBookPage() {
  return <MemoryBook />;
}
