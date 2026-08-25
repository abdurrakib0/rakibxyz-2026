import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        accent: "var(--accent)",
        rule: "var(--rule)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Newsreader", "Georgia", "serif"],
        serif: ["var(--font-display)", "Newsreader", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "-apple-system", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
