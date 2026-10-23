import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Jetons du cahier des charges (section 6) et de la refonte, définis dans src/app/globals.css.
// Les couleurs sont des variables CSS : elles changent avec le thème sans classe `dark:`.
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["selector", '[data-theme="sombre"]'],
  theme: {
    screens: {
      // mobile jusqu'à 639 px, tablette 640-1023 px, ordinateur 1024 px et plus, grand écran 1280 px
      sm: "640px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        bg: "var(--bg)",
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)", 3: "var(--surface-3)" },
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        inverse: { DEFAULT: "var(--inverse)", ink: "var(--inverse-ink)" },
        bandeau: { DEFAULT: "var(--bandeau)", ink: "var(--bandeau-ink)", line: "var(--bandeau-line)" },
        voile: "var(--voile)",
        primary: {
          DEFAULT: "var(--primary)",
          strong: "var(--primary-strong)",
          ink: "var(--primary-ink)",
          soft: "var(--primary-soft)",
        },
        focus: "var(--focus)",
        nuit: {
          DEFAULT: "var(--nuit)",
          2: "var(--nuit-2)",
          line: "var(--nuit-line)",
          ink: "var(--nuit-ink)",
          "ink-2": "var(--nuit-ink-2)",
          "ink-3": "var(--nuit-ink-3)",
        },
        accent: "var(--accent)",
        vif: "var(--vif)",
        water: { DEFAULT: "var(--water)", line: "var(--water-line)" },
        prio: {
          high: "var(--prio-high)",
          mid: "var(--prio-mid)",
          low: "var(--prio-low)",
          none: "var(--prio-none)",
        },
        ok: "var(--ok)",
        off: "var(--off)",
        danger: { DEFAULT: "var(--danger)", soft: "var(--danger-soft)" },
        "on-color": "var(--on-color)",
      },
      opacity: { zone: "var(--zone-opacity)", eau: "var(--water-opacity)" },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        mention: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        surtitre: ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.06em" }],
        petit: ["14px", { lineHeight: "20px" }],
        texte: ["16px", { lineHeight: "24px" }],
        titre3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        titre2: ["20px", { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.01em" }],
        titre1: ["24px", { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.015em" }],
        chiffre: ["32px", { lineHeight: "40px", fontWeight: "600", letterSpacing: "-0.02em" }],
        display: ["40px", { lineHeight: "44px", fontWeight: "600", letterSpacing: "-0.025em" }],
        intro: ["18px", { lineHeight: "32px" }],
        "titre-page": ["30px", { lineHeight: "40px", fontWeight: "600", letterSpacing: "-0.02em" }],
        hero: ["34px", { lineHeight: "42px", fontWeight: "600", letterSpacing: "-0.025em" }],
        "hero-lg": ["48px", { lineHeight: "56px", fontWeight: "600", letterSpacing: "-0.03em" }],
        geant: ["64px", { lineHeight: "1", fontWeight: "600", letterSpacing: "-0.03em" }],
        ecran: ["120px", { lineHeight: "1", fontWeight: "600", letterSpacing: "-0.03em" }],
        "ecran-xl": ["200px", { lineHeight: "1", fontWeight: "600", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        pixel: "2px",
        xs: "var(--radius-xs)",
        interne: "var(--radius-interne)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        float: "var(--shadow-float)",
        pop: "var(--shadow-pop)",
      },
      spacing: {
        topbar: "var(--topbar-h)",
        apercu: "var(--apercu-h)",
        panneau: "var(--panneau-w)",
        barre: "var(--barre-w)",
        rail: "var(--rail-w)",
        cible: "44px",
      },
      maxWidth: { lecture: "var(--lecture-w)" },
      // carte < contrôles flottants < panneau < barre du haut < infobulle < dialogue
      zIndex: { controle: "10", panneau: "20", barre: "30", infobulle: "40", dialogue: "50" },
      transitionDuration: {
        DEFAULT: "var(--duree)",
        etat: "var(--duree-etat)",
        feuille: "var(--duree-feuille)",
        chiffre: "var(--duree-chiffre)",
        niveau: "var(--duree-niveau)",
      },
      transitionTimingFunction: { sortie: "var(--ease-sortie)", ressort: "var(--ease-ressort)" },
      minHeight: { cible: "44px" },
      minWidth: { cible: "44px" },
    },
  },
  plugins: [animate],
};

export default config;
