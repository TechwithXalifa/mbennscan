import { ArrowLeft, ArrowUpRight, Building2, Droplets, School, Search, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { IndicateurConfiance } from "@/components/zone/badges";
import { ICONE, ICONE_PETITE } from "@/lib/design";
import { formatDate, formatHabitants, formatNombre } from "@/lib/format";
import { LIBELLE_EAU } from "@/lib/synthese";
import { cn } from "@/lib/utils";
import type { ActionSuggeree, Evenement, ImpactEvenement, ZoneSynthese } from "@/types/contracts";

export const ACTION: Record<ActionSuggeree, { libelle: string; Icone: LucideIcon }> = {
  pomper: { libelle: "Pomper", Icone: Droplets },
  recenser: { libelle: "Recenser", Icone: Users },
  visiter: { libelle: "Visiter", Icone: Search },
};

/** Action suggérée par le calcul : un mot, une icône, jamais une couleur de priorité. */
export function BadgeAction({ action, className }: { action: ActionSuggeree; className?: string }) {
  const { libelle, Icone } = ACTION[action];
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-pill border border-line bg-surface px-2 text-petit text-ink",
        className,
      )}
    >
      <Icone size={14} strokeWidth={1.75} aria-hidden />
      {libelle}
    </span>
  );
}

/**
 * Fiche d'urgence d'une zone après un épisode : ce que montre l'image, l'action suggérée et ses limites.
 * S'ouvre dans le panneau, sans quitter la carte ; « retour » ramène à la liste.
 */
export function FicheUrgence({
  impact,
  zone,
  evenement,
  onRetour,
}: {
  impact: ImpactEvenement;
  zone: ZoneSynthese | undefined;
  evenement: Evenement;
  onRetour: () => void;
}) {
  const { libelle, Icone } = ACTION[impact.action_suggeree];
  const lignes: { Icone: LucideIcon; libelle: string; valeur: string }[] = [
    { Icone: Droplets, libelle: "Surface en eau", valeur: `${formatNombre(impact.surface_eau_pct)} %` },
    { Icone: Users, libelle: "Habitants", valeur: `environ ${formatHabitants(impact.habitants_touches)}` },
    { Icone: Building2, libelle: "Bâtiments", valeur: formatNombre(impact.batiments_touches) },
    { Icone: School, libelle: "Écoles", valeur: formatNombre(impact.ecoles_touchees) },
  ];

  return (
    <article className="space-y-5 py-2" aria-labelledby="titre-urgence">
      <button
        type="button"
        onClick={onRetour}
        className="-ml-1 inline-flex min-h-cible items-center gap-2 rounded-sm px-1 font-medium text-primary-ink"
      >
        <ArrowLeft {...ICONE} aria-hidden />À visiter en priorité
      </button>

      <header>
        <p className="text-surtitre uppercase text-ink-3">Fiche d&apos;urgence{zone && ` · ${zone.commune}`}</p>
        <h3 id="titre-urgence" className="mt-1 text-titre2 text-ink">
          {zone?.nom ?? impact.zone_id}
        </h3>
        {zone && (
          <div className="mt-2">
            <IndicateurConfiance confiance={zone.confiance} explique />
          </div>
        )}
      </header>

      <div className="rounded-lg border border-line bg-surface-2 p-4">
        <p className="flex items-center gap-2 text-petit font-medium text-ink-2">
          <Icone {...ICONE_PETITE} aria-hidden />
          Action suggérée
        </p>
        <p className="mt-1 text-titre1 text-ink">{libelle}</p>
        <p className="mt-1 text-petit text-ink-2">
          Suggestion du calcul à partir de l&apos;image du{" "}
          {evenement.date_image ? formatDate(evenement.date_image) : "dernier passage"}, à confirmer sur le terrain :
          une aide à la décision, pas une consigne.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        {lignes.map(({ Icone: I, libelle: l, valeur }) => (
          <div key={l} className="rounded-lg border border-line p-3">
            <dt className="flex items-center gap-1.5 text-petit text-ink-2">
              <I {...ICONE_PETITE} className="text-ink-3" aria-hidden />
              {l}
            </dt>
            <dd className="mt-1 text-titre3 tabular-nums text-ink">{valeur}</dd>
          </div>
        ))}
      </dl>

      {zone?.classe_eau && (
        <p className="text-petit text-ink-2">
          <span className="font-medium text-ink">D&apos;habitude (2020-2026) :</span> {LIBELLE_EAU[zone.classe_eau]}.
        </p>
      )}

      <p className="text-petit text-ink-2">
        L&apos;image montre l&apos;eau au moment du passage du satellite, pas maintenant : l&apos;eau a pu baisser ou
        monter depuis.
      </p>

      <Link
        href={`/zone/${encodeURIComponent(impact.zone_id)}`}
        className="inline-flex min-h-cible items-center gap-1 font-medium text-primary-ink underline-offset-4 hover:underline"
      >
        Fiche complète de la zone
        <ArrowUpRight {...ICONE_PETITE} aria-hidden />
      </Link>
    </article>
  );
}
