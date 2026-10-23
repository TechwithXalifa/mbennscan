import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BarreHaut } from "@/components/shell/barre-haut";
import { STYLE_CARTE } from "@/lib/design";
import { SCRIPT_THEME } from "@/lib/theme";
import { HorsLigne } from "@/components/hors-ligne";
import { PaletteRecherche } from "@/components/shell/palette-recherche";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "MbënnScan",
  description: "Mesurer par satellite où l'eau reste, et combien de temps, pour agir avant la pluie et juste après.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E5A8A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme est posé avant l'affichage par SCRIPT_THEME : le rendu serveur ne le connaît pas.
    <html lang="fr" className={inter.variable} data-theme="clair" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
        {/* Le fond de carte est le plus long à venir : ouvrir la connexion dès le HTML. */}
        <link rel="preconnect" href={new URL(STYLE_CARTE).origin} crossOrigin="" />
      </head>
      <body className="flex h-dvh flex-col bg-bg font-sans text-ink print:block print:h-auto">
        <BarreHaut />
        <HorsLigne />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto print:overflow-visible">{children}</div>
        <PaletteRecherche />
      </body>
    </html>
  );
}
