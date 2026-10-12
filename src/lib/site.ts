import { weddingConfig } from "@/config/wedding.config";

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const coupleTitle = `${weddingConfig.groom.name} & ${weddingConfig.bride.name}`;

export function themeCss(): string {
  const vars = (c: Record<string, string>) =>
    Object.entries(c)
      .map(([k, v]) => `--c-${k}:${v};`)
      .join("");
  return Object.entries(weddingConfig.themes)
    .map(([name, colors]) => `${name === weddingConfig.theme ? ":root," : ""}[data-theme="${name}"]{${vars(colors)}}`)
    .join("\n");
}
