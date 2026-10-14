import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "rgb(var(--c-bg) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        maroon: "rgb(var(--c-maroon) / <alpha-value>)",
        jasmine: "rgb(var(--c-white) / <alpha-value>)",
        turmeric: "rgb(var(--c-accent) / <alpha-value>)",
        leaf: "rgb(var(--c-green) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        bride: "rgb(var(--c-bride) / <alpha-value>)",
        groom: "rgb(var(--c-groom) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-noto-ml)", "var(--font-noto-ta)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "var(--font-noto-ml)", "var(--font-noto-ta)", "var(--font-noto-te)", "var(--font-noto-kn)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--c-ink) / 0.04), 0 4px 10px -4px rgb(var(--c-ink) / 0.06), 0 18px 36px -20px rgb(var(--c-ink) / 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
