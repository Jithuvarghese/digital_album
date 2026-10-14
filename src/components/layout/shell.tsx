"use client";

import { usePathname } from "next/navigation";
import { BottomNav, DemoBadge, SiteFooter, SiteHeader } from "./site-shell";
import { PresenterMenu } from "./presenter-menu";
import { MusicToggle } from "./music-toggle";

/** Wraps pages with header, nav and footer. The venue screen and print views get a bare layout. */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/live") || pathname.startsWith("/memory-book")) {
    return <main id="main">{children}</main>;
  }
  return (
    <>
      <SiteHeader />
      <DemoBadge />
      <main id="main">{children}</main>
      <SiteFooter />
      <BottomNav />
      <PresenterMenu />
      <MusicToggle />
    </>
  );
}
