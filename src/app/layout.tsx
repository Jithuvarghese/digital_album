import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { fontVariables } from "./fonts";
import { weddingConfig } from "@/config/wedding.config";
import { coupleTitle, siteUrl, themeCss } from "@/lib/site";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/layout/shell";

const description = `Join us for the wedding of ${coupleTitle} in Kochi on 15 November 2026. Schedule, photos, blessings and the Bride vs Groom game.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${coupleTitle} · Our Story, Live`, template: `%s · ${coupleTitle}` },
  description,
  applicationName: "Our Story, Live",
  openGraph: {
    type: "website",
    title: `${coupleTitle} are getting married`,
    description,
    siteName: "Our Story, Live",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: `${coupleTitle} are getting married`, description },
  appleWebApp: { capable: true, title: coupleTitle, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: `rgb(${weddingConfig.themes[weddingConfig.theme].maroon.replaceAll(" ", ",")})`,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={weddingConfig.theme} className={fontVariables} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body>
        <Providers><Shell>{children}</Shell></Providers>
      </body>
    </html>
  );
}
