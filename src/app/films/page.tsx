import type { Metadata } from "next";
import { FilmsView } from "@/components/films/films-view";

export const metadata: Metadata = { title: "Films & highlights" };

export default function FilmsPage() {
  return <FilmsView />;
}
