import type { MetadataRoute } from "next";
import { weddingConfig } from "@/config/wedding.config";

const rgb = (triplet: string) => `rgb(${triplet.replaceAll(" ", ",")})`;

export default function manifest(): MetadataRoute.Manifest {
  const theme = weddingConfig.themes[weddingConfig.theme];
  return {
    name: `${weddingConfig.groom.name} & ${weddingConfig.bride.name} · Our Story, Live`,
    short_name: `${weddingConfig.groom.name[0]} & ${weddingConfig.bride.name[0]}`,
    description: "Wedding schedule, photos, blessings and the Bride vs Groom game.",
    start_url: "/",
    display: "standalone",
    background_color: rgb(theme.bg),
    theme_color: rgb(theme.maroon),
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
