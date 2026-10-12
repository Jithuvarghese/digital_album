import { Cormorant_Garamond, DM_Sans, Noto_Sans_Malayalam, Noto_Sans_Tamil, Noto_Sans_Telugu, Noto_Sans_Kannada } from "next/font/google";

export const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
export const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export const notoMl = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: ["400", "600"], variable: "--font-noto-ml", display: "swap", preload: false });
export const notoTa = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "600"], variable: "--font-noto-ta", display: "swap", preload: false });
export const notoTe = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400"], variable: "--font-noto-te", display: "swap", preload: false });
export const notoKn = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400"], variable: "--font-noto-kn", display: "swap", preload: false });

export const fontVariables = [serif, sans, notoMl, notoTa, notoTe, notoKn].map((f) => f.variable).join(" ");
