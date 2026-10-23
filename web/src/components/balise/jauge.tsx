import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** Niveau affiché, déjà ramené à 0 s'il était négatif */
  niveauCm: number;
  /** Hauteur utile du bac : distance capteur - fond à vide */
  hauteurCm: number;
  seuilCm: number | null;
  /** Aucune mesure : le bac est dessiné vide, sans eau inventée */
  sansMesure?: boolean;
  className?: string;
};

/**
 * Réservoir vertical qui se remplit, avec la ligne du seuil d'alerte et des graduations.
 * La surface de l'eau ondule. Au-delà du seuil, le bord prend la couleur d'alerte (jamais une couleur de priorité)
 * et « Seuil dépassé » est écrit à côté.
 */
export function Jauge({ niveauCm, hauteurCm, seuilCm, sansMesure = false, className }: Props) {
  const pct = (cm: number) => Math.min(100, Math.max(0, (cm / hauteurCm) * 100));
  const depasse = !sansMesure && seuilCm !== null && niveauCm >= seuilCm;
  // Graduations au quart, sauf celle que masquerait l'étiquette du seuil.
  const graduations = [0.25, 0.5, 0.75]
    .map((f) => Math.round(hauteurCm * f))
    .filter((g) => seuilCm === null || Math.abs(g - seuilCm) > hauteurCm * 0.08);

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={hauteurCm}
      aria-valuenow={sansMesure ? undefined : niveauCm}
      aria-valuetext={
        sansMesure ? "aucune mesure" : `${formatNombre(Math.round(niveauCm))} cm${depasse ? ", seuil dépassé" : ""}`
      }
      aria-label="Niveau d'eau dans le bac"
      className={cn(
        "relative h-64 w-28 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-2 transition-colors duration-etat",
        depasse ? "border-danger" : "border-line-strong",
        className,
      )}
    >
      {graduations.map((g) => (
        <div
          key={g}
          className="absolute left-0 w-3 border-t border-line-strong"
          style={{ bottom: `${pct(g)}%` }}
          aria-hidden
        >
          <span className="absolute left-4 -translate-y-1/2 text-[10px] tabular-nums text-ink-3">{g}</span>
        </div>
      ))}
      {!sansMesure && (
        <div
          className="absolute inset-x-0 bottom-0 bg-water transition-[height] duration-700 ease-sortie"
          style={{ height: `${pct(niveauCm)}%`, opacity: depasse ? 0.85 : 0.6 }}
        >
          {niveauCm > 0 && (
            <svg
              viewBox="0 0 120 8"
              preserveAspectRatio="none"
              aria-hidden
              className="vague absolute -top-[7px] left-0 h-2 w-[200%] fill-water"
            >
              <path d="M0 4 Q15 0 30 4 T60 4 T90 4 T120 4 V8 H0 Z" />
            </svg>
          )}
        </div>
      )}
      {seuilCm !== null && (
        <div className="absolute inset-x-0 border-t-2 border-dashed border-ink" style={{ bottom: `${pct(seuilCm)}%` }}>
          <span className="absolute right-1 -translate-y-1/2 rounded-sm bg-surface px-1 text-mention text-ink">
            Seuil {formatNombre(seuilCm)} cm
          </span>
        </div>
      )}
    </div>
  );
}
