"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function useSiteUrl(path = "/") {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;
    setUrl(base + path);
  }, [path]);
  return url;
}

export async function qrSvg(text: string, dark = "#2B1C18", light = "#FFFFFF") {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark, light } });
}

export function QrCode({ value, className = "", dark, light, label }: { value: string; className?: string; dark?: string; light?: string; label?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    if (!value) return;
    let alive = true;
    void qrSvg(value, dark, light).then((s) => alive && setSvg(s));
    return () => {
      alive = false;
    };
  }, [value, dark, light]);
  return (
    <div
      role="img"
      aria-label={label ?? `QR code for ${value}`}
      className={`[&>svg]:h-full [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
