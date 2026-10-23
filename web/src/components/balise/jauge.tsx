import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** Niveau mesuré ; null sans mesure valide : le bac reste vide, sans eau inventée */
  niveauCm: number | null;
  /** Distance capteur - fond à vide : le haut de la jauge */
  hauteurCm: number;
  seuilCm: number | null;
  /** Ce que lit un lecteur d'écran quand il n'y a pas de niveau */
  sansNiveau?: string;
  className?: string;
};

/** Pas des graduations : au plus huit intervalles sur la hauteur du bac. */
const pas = (hauteurCm: number) => [5, 10, 20, 25, 50].find((p) => hauteurCm / p <= 8) ?? 100;

/**
 * Le bac à l'échelle, du fond (0) au capteur : c'est l'objet qui se remplit pendant la démo.
 * Le seuil d'alerte est en pointillé ; au-delà, les parois prennent la couleur d'alerte (jamais une couleur
 * de priorité). Le repère humain est écrit à côté, pas dessiné : la balise mesure un bac, pas une rue.
 */
export function Jauge({ niveauCm, hauteurCm, seuilCm, sansNiveau = "aucune mesure", className }: Props) {
  const pct = (cm: number) => Math.min(100, Math.max(0, (cm / hauteurCm) * 100));
  const depasse = niveauCm !== null && seuilCm !== null && niveauCm >= seuilCm;
  const p = pas(hauteurCm);
  const graduations = Array.from({ length: Math.floor(hauteurCm / p) + 1 }, (_, i) => i * p);

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={hauteurCm}
      aria-valuenow={niveauCm === null ? undefined : Math.min(niveauCm, hauteurCm)}
      aria-valuetext={
        niveauCm === null ? sansNiveau : `${formatNombre(Math.round(niveauCm))} cm${depasse ? ", seuil dépassé" : ""}`
      }
      aria-label="Niveau d'eau dans le bac"
      className={cn("flex h-64 shrink-0 gap-1.5 py-2", className)}
    >
      <div
        className={cn(
          "relative w-24 overflow-hidden rounded-b-lg border-x-2 border-b-2 bg-surface-2 transition-colors duration-etat",
          depasse ? "border-danger" : "border-line-strong",
        )}
      >
        {/* Capteur, en haut du bac */}
        <div className="absolute left-1/2 top-0 h-1.5 w-10 -translate-x-1/2 rounded-b-xs bg-ink-3" aria-hidden />
        {niveauCm !== null && (
          <div
            className="absolute inset-x-0 bottom-0 bg-water transition-[height] duration-niveau ease-sortie"
            style={{ height: `${pct(niveauCm)}%`, opacity: depasse ? 0.85 : 0.6 }}
          >
            {niveauCm > 0 && (
              <svg
                viewBox="0 0 120 8"
                preserveAspectRatio="none"
                aria-hidden
                className="vague absolute -top-2 left-0 h-2 w-[200%] fill-water"
              >
                <path d="M0 4 Q15 0 30 4 T60 4 T90 4 T120 4 V8 H0 Z" />
              </svg>
            )}
          </div>
        )}
        {seuilCm !== null && (
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-ink"
            style={{ bottom: `${pct(seuilCm)}%` }}
          >
            <span className="absolute right-1 -translate-y-1/2 whitespace-nowrap rounded-xs bg-surface px-1 text-mention text-ink">
              Seuil {formatNombre(seuilCm)} cm
            </span>
          </div>
        )}
      </div>

      {/* Graduations hors du bac, pour rester lisibles au-dessus de l'eau */}
      <div className="relative w-7" aria-hidden>
        {graduations.map((g) => (
          <div key={g} className="absolute left-0 w-1.5 border-t border-line-strong" style={{ bottom: `${pct(g)}%` }}>
            <span className="absolute left-2.5 -translate-y-1/2 text-mention tabular-nums text-ink-3">{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
