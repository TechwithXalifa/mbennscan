import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BarreHaut } from "@/components/barre-haut";
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
      <body className="flex h-dvh flex-col bg-bg font-sans text-ink print:block print:h-auto">
        <BarreHaut />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto print:overflow-visible">{children}</div>
      </body>
    </html>
  );
}
