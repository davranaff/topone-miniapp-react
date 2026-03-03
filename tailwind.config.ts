import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        glow: "0 18px 60px rgba(212, 160, 23, 0.18)",
        card: "0 24px 64px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(212,160,23,0.2), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.92), rgba(246,249,255,0.85))",
      },
    },
  },
  plugins: [],
} satisfies Config;
