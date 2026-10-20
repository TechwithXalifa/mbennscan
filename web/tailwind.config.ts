import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Jetons du cahier des charges (section 6), définis dans src/app/globals.css.
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    screens: {
      // mobile jusqu'à 639 px, tablette 640-1023 px, ordinateur 1024 px et plus
      sm: "640px",
      lg: "1024px",
    },
    extend: {
      colors: {
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)" },
        bg: "var(--bg)",
        surface: "var(--surface)",
        line: "var(--line)",
        primary: { DEFAULT: "var(--primary)", strong: "var(--primary-strong)" },
        water: { DEFAULT: "var(--water)", line: "var(--water-line)" },
        prio: {
          high: "var(--prio-high)",
          mid: "var(--prio-mid)",
          low: "var(--prio-low)",
          none: "var(--prio-none)",
        },
        ok: "var(--ok)",
        off: "var(--off)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        mention: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        petit: ["14px", { lineHeight: "20px" }],
        texte: ["16px", { lineHeight: "24px" }],
        titre3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        titre2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        titre1: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        chiffre: ["32px", { lineHeight: "40px", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        float: "var(--shadow-float)",
      },
      spacing: {
        topbar: "var(--topbar-h)",
        cible: "44px",
      },
      minHeight: { cible: "44px" },
      minWidth: { cible: "44px" },
    },
  },
  plugins: [animate],
};

export default config;
