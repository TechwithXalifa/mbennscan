import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo MbënnScan (fichiers de public/brand, jamais recolorés).
 * `surFonce` : version blanche sur la barre latérale ; sinon couleur en thème clair, blanche en thème sombre.
 * `seul` : pictogramme sans logotype (barre latérale repliée, petites tailles).
 */
export function Logo({
  surFonce = false,
  seul = false,
  className,
}: {
  surFonce?: boolean;
  seul?: boolean;
  className?: string;
}) {
  const largeur = seul ? 28 : 137;
  const fichier = (variante: "couleur" | "blanc") => `/brand/${seul ? "pictogramme" : "logo"}-${variante}.svg`;
  if (surFonce) {
    return <Image src={fichier("blanc")} alt="MbënnScan" width={largeur} height={28} priority className={className} />;
  }
  return (
    <>
      <Image
        src={fichier("couleur")}
        alt="MbënnScan"
        width={largeur}
        height={28}
        priority
        className={cn("dark:hidden", className)}
      />
      <Image
        src={fichier("blanc")}
        alt="MbënnScan"
        width={largeur}
        height={28}
        priority
        className={cn("hidden dark:block", className)}
      />
    </>
  );
}
