"use client";

import { Moon, Sun, type LucideIcon } from "lucide-react";
import { ICONE_PETITE } from "@/lib/design";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { valeur: Theme; libelle: string; Icone: LucideIcon }[] = [
  { valeur: "sombre", libelle: "Sombre", Icone: Moon },
  { valeur: "clair", libelle: "Clair", Icone: Sun },
];

/** Choix du thème : sombre (par défaut) ou clair (plus lisible en plein soleil). */
export function ChoixTheme({ surFonce = false, avecLibelles = false }: { surFonce?: boolean; avecLibelles?: boolean }) {
  const { theme, choisir } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Thème de l'interface"
      className={cn("flex rounded-md p-[3px]", surFonce ? "bg-nuit-2" : "bg-surface-3")}
    >
      {OPTIONS.map(({ valeur, libelle, Icone }) => {
        const coche = theme === valeur;
        return (
          <button
            key={valeur}
            type="button"
            role="radio"
            aria-checked={coche}
            aria-label={avecLibelles ? undefined : `Thème ${libelle.toLowerCase()}`}
            title={`Thème ${libelle.toLowerCase()}`}
            onClick={() => choisir(valeur)}
            className={cn(
              "inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2 text-petit font-medium transition-colors [@media(pointer:coarse)]:min-h-cible",
              surFonce
                ? coche
                  ? "bg-nuit text-nuit-ink shadow-1"
                  : "text-nuit-ink-2 hover:text-nuit-ink"
                : coche
                  ? "bg-surface text-ink shadow-1"
                  : "text-ink-2 hover:text-ink",
            )}
          >
            <Icone {...ICONE_PETITE} aria-hidden />
            {avecLibelles && libelle}
          </button>
        );
      })}
    </div>
  );
}

/** Bouton unique clair ↔ sombre, pour l'en-tête. */
export function BasculeTheme() {
  const { theme, choisir } = useTheme();
  const sombre = theme === "sombre";
  return (
    <button
      type="button"
      onClick={() => choisir(sombre ? "clair" : "sombre")}
      aria-label={sombre ? "Passer au thème clair" : "Passer au thème sombre"}
      title={sombre ? "Thème clair" : "Thème sombre"}
      className="inline-flex size-10 items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink [@media(pointer:coarse)]:size-cible"
    >
      {sombre ? <Sun {...ICONE_PETITE} aria-hidden /> : <Moon {...ICONE_PETITE} aria-hidden />}
    </button>
  );
}
