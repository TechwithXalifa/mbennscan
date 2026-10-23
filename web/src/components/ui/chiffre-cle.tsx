import type { LucideIcon } from "lucide-react";
import { Infobulle } from "@/components/ui/infobulle";
import { ICONE_PETITE } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Carte de chiffre clé : intitulé, valeur en grand avec son unité, phrase d'explication, « i » facultatif.
 * `valeur` accepte un `<Compteur>` pour que le chiffre défile à l'affichage.
 * `mis-en-avant` : l'indicateur principal d'une grille (habitants-jours), sur deux colonnes.
 * Sans valeur disponible, passer `valeur={null}` : la carte dit « Non disponible » au lieu d'un zéro trompeur.
 */
export function ChiffreCle({
  valeur,
  unite,
  intitule,
  phrase,
  info,
  icone: Icone,
  mot = false,
  misEnAvant = false,
  className,
}: {
  valeur: React.ReactNode | null;
  unite?: string;
  intitule: string;
  phrase?: string;
  info?: React.ReactNode;
  icone?: LucideIcon;
  /** Valeur en toutes lettres (type d'eau) : écrite plus petit pour tenir sur mobile. */
  mot?: boolean;
  misEnAvant?: boolean;
  className?: string;
}) {
  const indisponible = valeur === null;
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-line bg-surface p-4",
        misEnAvant && "col-span-2 bg-surface halo-entete",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icone && (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary-ink">
            <Icone {...ICONE_PETITE} aria-hidden />
          </span>
        )}
        <p className="min-w-0 flex-1 text-petit font-medium text-ink-2">{intitule}</p>
        {info && <Infobulle libelle={`À propos : ${intitule}`}>{info}</Infobulle>}
      </div>
      <p
        className={cn(
          "mt-3 tabular-nums text-vif",
          indisponible ? "text-titre3 text-ink-3" : mot ? "text-titre2" : misEnAvant ? "text-display" : "text-chiffre",
        )}
      >
        {indisponible ? "Non disponible" : valeur}
        {!indisponible && unite && <span className="ml-1 text-petit font-medium text-ink-2">{unite}</span>}
      </p>
      {phrase && <p className="mt-1 text-petit text-ink-2">{phrase}</p>}
    </div>
  );
}
