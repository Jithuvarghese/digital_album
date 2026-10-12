import { ImageResponse } from "next/og";
import { weddingConfig } from "@/config/wedding.config";

export const alt = `${weddingConfig.groom.name} & ${weddingConfig.bride.name} wedding invitation`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const flowers = Array.from({ length: 13 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #FBF6EC 0%, #F3E3C7 100%)", position: "relative", fontFamily: "Georgia, serif" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "18px 40px" }}>
          {flowers.map((i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: i % 3 === 1 ? "#E8A317" : "#FFFFFF", border: "2px solid #C9A24B", marginTop: Math.sin((i / 12) * Math.PI) * 40 }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 24, border: "3px solid #C9A24B", borderRadius: 24, display: "flex" }} />
        <div style={{ position: "absolute", inset: 34, border: "1px solid #C9A24B", borderRadius: 18, display: "flex" }} />
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#C9A24B", textTransform: "uppercase" }}>You are invited</div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 112, color: "#6B1F2A", marginTop: 12 }}>
          {weddingConfig.groom.name}
          <span style={{ fontSize: 72, color: "#C9A24B", margin: "0 28px", fontStyle: "italic" }}>&amp;</span>
          {weddingConfig.bride.name}
        </div>
        <div style={{ width: 220, height: 4, background: "#C9A24B", margin: "24px 0" }} />
        <div style={{ fontSize: 36, color: "#2B1C18" }}>15 November 2026 · Kochi, Kerala</div>
        <div style={{ fontSize: 24, color: "#6E5C50", marginTop: 14 }}>Photos · Blessings · Bride vs Groom</div>
      </div>
    ),
    size,
  );
}
