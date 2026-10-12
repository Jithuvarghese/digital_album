"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ComponentType } from "react";
import { weddingConfig, type Lang, type ModuleKey } from "@/config/wedding.config";
import { isSupabaseConfigured } from "@/data";
import { useSettings } from "@/data/hooks";
import { languageNames, type StringKey } from "@/lib/i18n";
import { useDevice } from "@/state/device";
import { useT } from "@/state/ui";
import { Monogram } from "@/components/ui/ornaments";
import { TeamEmblem } from "@/components/game/team-emblem";
import {
  BlessIcon, CalendarIcon, CameraIcon, CapsuleIcon, CloseIcon, FilmIcon, HeartIcon, MenuIcon, PlayIcon, ShareIcon, SparkleIcon, TvIcon, TrophyIcon,
} from "@/components/ui/icons";

type NavItem = { href: string; key: StringKey; icon: ComponentType<{ size?: number }>; module?: ModuleKey };

const allNav: NavItem[] = [
  { href: "/", key: "nav.home", icon: HeartIcon },
  { href: "/gallery", key: "nav.gallery", icon: SparkleIcon, module: "gallery" },
  { href: "/upload", key: "nav.upload", icon: CameraIcon, module: "upload" },
  { href: "/blessings", key: "nav.blessings", icon: BlessIcon, module: "blessings" },
  { href: "/play", key: "nav.play", icon: TrophyIcon, module: "play" },
  { href: "/films", key: "nav.films", icon: FilmIcon, module: "films" },
  { href: "/capsule", key: "nav.capsule", icon: CapsuleIcon, module: "capsule" },
  { href: "/#events", key: "nav.schedule", icon: CalendarIcon, module: "events" },
  { href: "/share", key: "nav.share", icon: ShareIcon },
];

const bottomKeys = ["/", "/gallery", "/upload", "/blessings", "/play"];

export function useNav() {
  const modules = useSettings((s) => s.settings.modulesEnabled);
  return allNav.filter((n) => !n.module || modules[n.module] !== false);
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const lang = useDevice((s) => s.lang);
  const setLang = useDevice((s) => s.setLang);
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className={`min-h-[40px] cursor-pointer appearance-none rounded-full border border-gold/40 bg-paper pl-3 pr-7 text-sm text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/30 ${compact ? "max-w-[96px]" : ""}`}
      >
        {weddingConfig.languages.map((l) => (
          <option key={l} value={l}>
            {languageNames[l]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-xs text-maroon" aria-hidden>▾</span>
    </label>
  );
}

export function SiteHeader() {
  const t = useT();
  const nav = useNav();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only z-[90] rounded bg-maroon px-4 py-2 text-jasmine focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        Skip to content
      </a>
      <header className={`no-print sticky top-0 z-40 transition ${scrolled ? "bg-ivory/90 shadow-sm backdrop-blur" : "bg-transparent"}`}>
        <div className="container-wide flex h-16 items-center gap-3">
          <Link href="/" className="flex min-h-[44px] items-center gap-2" aria-label="Home">
            <Monogram className="h-10 w-10" />
            <span className="hidden font-serif text-lg text-maroon sm:inline">
              {weddingConfig.groom.name} &amp; {weddingConfig.bride.name}
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
            {nav.slice(1, 7).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition hover:bg-gold/15 ${pathname === n.href ? "text-maroon" : "text-ink/80"}`}
                aria-current={pathname === n.href ? "page" : undefined}
              >
                {t(n.key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <TeamEmblem />
            <LanguageSwitcher compact />
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-maroon hover:bg-gold/15"
              aria-label={t("nav.menu")}
              aria-expanded={open}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-ink/40" aria-label={t("nav.close")} onClick={() => setOpen(false)} />
            <motion.nav
              aria-label="Menu"
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-ivory p-5 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <Monogram className="h-12 w-12" />
                <button onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-gold/15" aria-label={t("nav.close")}>
                  <CloseIcon />
                </button>
              </div>
              <ul className="flex-1 space-y-1 overflow-y-auto">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-base text-ink hover:bg-gold/15">
                      <span className="text-gold"><n.icon /></span>
                      {t(n.key)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/live" className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-base text-ink hover:bg-gold/15">
                    <span className="text-gold"><TvIcon /></span>
                    {t("qa.live")}
                  </Link>
                </li>
              </ul>
              <div className="mt-4 border-t border-gold/30 pt-4">
                <LanguageSwitcher />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BottomNav() {
  const t = useT();
  const nav = useNav();
  const pathname = usePathname();
  const items = nav.filter((n) => bottomKeys.includes(n.href));
  return (
    <nav aria-label="Quick" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-md">
        {items.map((n) => {
          const active = pathname === n.href;
          const center = n.href === "/upload";
          return (
            <li key={n.href} className="flex-1">
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? "text-maroon" : "text-muted"}`}
              >
                {center ? (
                  <span className="-mt-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-maroon text-jasmine shadow-card ring-4 ring-ivory">
                    <n.icon size={22} />
                  </span>
                ) : (
                  <n.icon size={21} />
                )}
                <span>{t(n.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const t = useT();
  const router = useRouter();
  const setIntroSeen = useDevice((s) => s.setIntroSeen);
  return (
    <footer className="no-print mt-10 border-t border-gold/30 pb-28 pt-10 lg:pb-10">
      <div className="container-wide flex flex-col items-center gap-4 text-center text-sm text-muted">
        <Monogram className="h-14 w-14" />
        <p className="font-serif text-lg text-maroon">{weddingConfig.hashtag}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className="btn-ghost btn-sm"
            onClick={() => {
              setIntroSeen(false);
              router.push("/");
              window.scrollTo({ top: 0 });
            }}
          >
            {t("intro.replay")}
          </button>
          <Link href="/share" className="btn-ghost btn-sm">{t("nav.share")}</Link>
          <Link href="/live" className="btn-ghost btn-sm"><PlayIcon size={14} /> {t("qa.live")}</Link>
          <Link href="/admin" className="btn-ghost btn-sm">Family login</Link>
        </div>
        <p>{t("common.privacy")}</p>
      </div>
    </footer>
  );
}

export function DemoBadge() {
  const t = useT();
  if (isSupabaseConfigured) return null;
  return (
    <div className="no-print pointer-events-none fixed right-2 top-[68px] z-30 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-jasmine/90">
      {t("common.demo")}
    </div>
  );
}
