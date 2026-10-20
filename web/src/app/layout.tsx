import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
      <body className="min-h-dvh bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
