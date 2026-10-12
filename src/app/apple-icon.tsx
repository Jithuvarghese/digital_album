import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#6B1F2A" }}>
        <div style={{ width: 150, height: 150, borderRadius: 75, border: "4px solid #C9A24B", display: "flex", alignItems: "center", justifyContent: "center", color: "#FBF6EC", fontSize: 56, fontFamily: "Georgia, serif" }}>
          K&amp;A
        </div>
      </div>
    ),
    size,
  );
}
