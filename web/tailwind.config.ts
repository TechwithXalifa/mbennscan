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
        "on-color": "var(--on-color)",
      },
      opacity: { zone: "var(--zone-opacity)", eau: "var(--water-opacity)" },
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
        apercu: "var(--apercu-h)",
        panneau: "var(--panneau-w)",
        cible: "44px",
      },
      maxWidth: { lecture: "var(--lecture-w)" },
      // carte < contrôles flottants < panneau < barre du haut < infobulle
      zIndex: { controle: "10", panneau: "20", barre: "30", infobulle: "40" },
      transitionDuration: { DEFAULT: "var(--duree)", etat: "var(--duree-etat)", chiffre: "var(--duree-chiffre)" },
      transitionTimingFunction: { sortie: "var(--ease-sortie)", ressort: "var(--ease-ressort)" },
      keyframes: {
        onde: { from: { transform: "scale(1)", opacity: "0.7" }, to: { transform: "scale(2.8)", opacity: "0" } },
        alerte: { "50%": { boxShadow: "0 0 0 6px rgba(217, 45, 32, 0.18)" } },
      },
      animation: { onde: "onde 1.8s var(--ease-sortie) infinite", alerte: "alerte 1.2s ease-in-out infinite" },
      minHeight: { cible: "44px" },
      minWidth: { cible: "44px" },
    },
  },
  plugins: [animate],
};

export default config;
