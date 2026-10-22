"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ControleSegmente, type Segment } from "@/components/ui/controle-segmente";
import { ICONE } from "@/lib/design";

type Mode = "avant" | "apres" | "balise";

const BALISE = process.env.NEXT_PUBLIC_DEFAULT_BALISE_ID || "bal-01";
const CHEMIN: Record<Mode, string> = { avant: "/", apres: "/apres", balise: `/balise/${BALISE}` };
const SEGMENTS: Segment<Mode>[] = [
  { valeur: "avant", libelle: "Avant la saison" },
  { valeur: "apres", libelle: "Après une pluie" },
  { valeur: "balise", libelle: "Balise" },
];

function modeDe(chemin: string): Mode | null {
  if (chemin === "/" || chemin.startsWith("/zone")) return "avant";
  if (chemin.startsWith("/apres")) return "apres";
  if (chemin.startsWith("/balise")) return "balise";
  return null;
}

/** Barre du haut (cahier des charges, section 7) : logo, sélecteur de mode, lien Méthode. */
export function BarreHaut() {
  const chemin = usePathname();
  const router = useRouter();
  const mode = modeDe(chemin);

  const selecteur = (
    <ControleSegmente
      libelle="Mode"
      segments={SEGMENTS}
      valeur={mode ?? "avant"}
      onChange={(m) => router.push(CHEMIN[m])}
    />
  );

  return (
    <header className="shrink-0 border-b border-line bg-surface print:hidden">
      <div className="flex h-topbar items-center gap-4 px-4">
        <Link href="/" className="flex min-h-cible items-center gap-2 text-titre3" aria-label="MbënnScan, accueil">
          <Image src="/brand/pictogramme-couleur.svg" alt="" width={28} height={28} priority />
          <span>
            Mbënn<span className="text-primary">Scan</span>
          </span>
        </Link>
        <div className="mx-auto hidden w-[480px] sm:block">{selecteur}</div>
        <Link
          href="/methode"
          aria-current={chemin === "/methode" ? "page" : undefined}
          className="ml-auto inline-flex min-h-cible items-center gap-2 text-primary aria-[current=page]:font-semibold sm:ml-0"
        >
          <BookOpen {...ICONE} aria-hidden />
          Méthode
        </Link>
      </div>
      {/* Sur mobile, le sélecteur passe sous la barre, en pleine largeur. */}
      <div className="px-4 pb-2 sm:hidden">{selecteur}</div>
    </header>
  );
}
