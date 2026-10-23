import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MbënnScan",
    short_name: "MbënnScan",
    description: "Mesurer par satellite où l'eau reste, et combien de temps, pour agir avant la pluie et juste après.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A111C",
    theme_color: "#0B1A2B",
    icons: [
      { src: "/brand/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icone-masquable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
