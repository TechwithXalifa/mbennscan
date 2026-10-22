import { formatNombre } from "@/lib/format";

type Props = {
  /** Niveau affiché, déjà ramené à 0 s'il était négatif */
  niveauCm: number;
  /** Hauteur utile du bac : distance capteur - fond à vide */
  hauteurCm: number;
  seuilCm: number | null;
};

/**
 * Réservoir vertical qui se remplit, avec la ligne du seuil d'alerte.
 * La surface de l'eau ondule ; au-delà du seuil, le bord passe au rouge et pulse (le texte « Seuil dépassé » reste affiché à côté).
 */
export function Jauge({ niveauCm, hauteurCm, seuilCm }: Props) {
  const pct = (cm: number) => Math.min(100, Math.max(0, (cm / hauteurCm) * 100));
  const depasse = seuilCm !== null && niveauCm >= seuilCm;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={hauteurCm}
      aria-valuenow={niveauCm}
      aria-valuetext={`${formatNombre(Math.round(niveauCm))} cm${depasse ? ", seuil dépassé" : ""}`}
      className={`relative h-64 w-28 overflow-hidden rounded-md border-2 bg-surface ${depasse ? "animate-alerte border-prio-high" : "border-ink-2"}`}
    >
      <div
        className="absolute inset-x-0 bottom-0 bg-water transition-[height] duration-700"
        style={{ height: `${pct(niveauCm)}%`, opacity: depasse ? 0.85 : 0.55 }}
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
      {seuilCm !== null && (
        <div className="absolute inset-x-0 border-t-2 border-dashed border-ink" style={{ bottom: `${pct(seuilCm)}%` }}>
          <span className="absolute right-1 -translate-y-full text-mention">Seuil {formatNombre(seuilCm)} cm</span>
        </div>
      )}
    </div>
  );
}
