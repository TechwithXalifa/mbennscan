import type { LucideIcon } from "lucide-react";
import { Infobulle } from "@/components/ui/infobulle";
import { ICONE_PETITE } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Indicateur compact d'une rangée de synthèse : intitulé, valeur, détail.
 * Moins lourd qu'une carte : sert quand plusieurs chiffres se lisent d'un seul regard au-dessus de la carte.
 */
export function Statistique({
  intitule,
  valeur,
  unite,
  detail,
  icone: Icone,
  info,
  principal = false,
  className,
}: {
  intitule: string;
  /** null : « Non disponible » */
  valeur: React.ReactNode | null;
  unite?: string;
  detail?: React.ReactNode;
  icone?: LucideIcon;
  info?: React.ReactNode;
  principal?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col justify-between gap-1", className)}>
      <p className="flex items-start gap-1.5 text-petit text-ink-2">
        {Icone && <Icone {...ICONE_PETITE} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />}
        <span className="line-clamp-2 min-w-0">{intitule}</span>
        {info && <Infobulle libelle={`À propos : ${intitule}`}>{info}</Infobulle>}
      </p>
      <p className={cn("tabular-nums leading-none text-ink", principal ? "text-chiffre" : "text-titre1")}>
        {valeur === null ? <span className="text-titre3 text-ink-3">Non disponible</span> : valeur}
        {valeur !== null && unite && <span className="ml-1 text-petit font-medium text-ink-2">{unite}</span>}
      </p>
      {detail && <p className="line-clamp-2 text-mention font-normal text-ink-3">{detail}</p>}
    </div>
  );
}
