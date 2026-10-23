import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BarreHaut } from "@/components/shell/barre-haut";
import { BarreLaterale } from "@/components/shell/barre-laterale";
import { PaletteRecherche } from "@/components/shell/palette-recherche";
import { HorsLigne } from "@/components/hors-ligne";
import { STYLE_CARTE, STYLE_CARTE_SOMBRE } from "@/lib/design";
import { SCRIPT_THEME } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "MbënnScan",
  description: "Mesurer par satellite où l'eau reste, et combien de temps, pour agir avant la pluie et juste après.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1A2B",
};

const origines = Array.from(new Set([STYLE_CARTE, STYLE_CARTE_SOMBRE].map((u) => new URL(u).origin)));

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme est posé avant l'affichage par SCRIPT_THEME : le rendu serveur ne le connaît pas.
    <html lang="fr" className={inter.variable} data-theme="sombre" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
        {/* Le fond de carte est le plus long à venir : ouvrir la connexion dès le HTML. */}
        {origines.map((o) => (
          <link key={o} rel="preconnect" href={o} crossOrigin="" />
        ))}
      </head>
      <body className="flex h-dvh bg-bg font-sans text-ink print:block print:h-auto">
        <a
          href="#contenu"
          className="sr-only z-dialogue rounded-sm bg-surface px-4 py-2 font-medium text-primary-ink shadow-pop focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Aller au contenu
        </a>
        <BarreLaterale />
        <div className="flex h-dvh min-w-0 flex-1 flex-col print:block print:h-auto">
          <BarreHaut />
          <HorsLigne />
          <div id="contenu" className="relative flex min-h-0 flex-1 flex-col overflow-y-auto print:overflow-visible">
            {children}
          </div>
        </div>
        <PaletteRecherche />
      </body>
    </html>
  );
}
