import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { STYLE_CARTE } from "@/lib/design";
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
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Le fond de carte est le plus long à venir : ouvrir la connexion dès le HTML. */}
        <link rel="preconnect" href={new URL(STYLE_CARTE).origin} crossOrigin="" />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
