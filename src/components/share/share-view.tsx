"use client";

import QRCode from "qrcode";
import { useState } from "react";
import { weddingConfig } from "@/config/wedding.config";
import { downloadFile } from "@/lib/calendar";
import { coupleTitle } from "@/lib/site";
import { formatDate } from "@/lib/text";
import { useT, useUi } from "@/state/ui";
import { Section, SectionHeader } from "@/components/ui/primitives";
import { DownloadIcon, ShareIcon } from "@/components/ui/icons";
import { Garland, Monogram } from "@/components/ui/ornaments";
import { QrCode, qrSvg, useSiteUrl } from "@/components/ui/qr-code";

export function ShareView() {
  const t = useT();
  const toast = useUi((s) => s.showToast);
  const url = useSiteUrl("/");
  const [copied, setCopied] = useState(false);
  const dark = "#6B1F2A";

  const message = `You're invited! ${coupleTitle} are getting married on ${formatDate(weddingConfig.muhurtham.start)} in Kochi. Schedule, photos, blessings and the Bride vs Groom game: ${url}`;

  const downloadPng = async () => {
    const dataUrl = await QRCode.toDataURL(url, { width: 1200, margin: 2, errorCorrectionLevel: "H", color: { dark, light: "#FFFFFF" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "karthik-anjali-qr.png";
    a.click();
  };
  const downloadSvg = async () => downloadFile("karthik-anjali-qr.svg", await qrSvg(url, dark), "image/svg+xml");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast(t("share.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(url);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: coupleTitle, text: message, url });
    } catch {
      /* cancelled */
    }
  };

  return (
    <Section className="pt-6">
      <div className="container-narrow">
        <SectionHeader title={t("share.title")} subtitle="Print this QR on the invitation and at the venue entrance. One scan opens everything." />

        <div className="card kasavu-frame mx-auto max-w-sm overflow-hidden text-center">
          <Garland className="h-10 w-full" />
          <div className="px-8 pb-8">
            <Monogram className="mx-auto h-14 w-14" />
            <p className="mt-2 font-serif text-2xl text-maroon">{coupleTitle}</p>
            <p className="text-sm text-muted">{formatDate(weddingConfig.muhurtham.start)}</p>
            <div className="mx-auto mt-5 w-56 rounded-2xl bg-white p-3 ring-1 ring-gold/40">
              <QrCode value={url} dark={dark} className="aspect-square w-full" />
            </div>
            <p className="mt-3 break-all text-xs text-muted">{url}</p>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={downloadPng}>
            <DownloadIcon size={18} /> PNG
          </button>
          <button className="btn-ghost" onClick={downloadSvg}>
            <DownloadIcon size={18} /> SVG
          </button>
          <a className="btn col-span-2 bg-[#25D366] text-white hover:bg-[#1ebe5a]" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            {t("share.whatsapp")}
          </a>
          <button className="btn-primary" onClick={copy}>
            {copied ? t("share.copied") : t("share.copy")}
          </button>
          <button className="btn-gold" onClick={nativeShare}>
            <ShareIcon size={18} /> More
          </button>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <p className="eyebrow mb-2 text-center">Link preview on WhatsApp</p>
          <div className="overflow-hidden rounded-xl bg-[#e7ffdb] p-2 shadow-sm">
            <div className="overflow-hidden rounded-lg bg-white">
              <img src="/opengraph-image" alt="Link preview image" className="aspect-[1200/630] w-full object-cover" loading="lazy" />
              <div className="p-3">
                <p className="text-sm font-semibold">{coupleTitle} are getting married</p>
                <p className="line-clamp-2 text-xs text-muted">Join us for the wedding of {coupleTitle} in Kochi. Schedule, photos, blessings and the Bride vs Groom game.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
