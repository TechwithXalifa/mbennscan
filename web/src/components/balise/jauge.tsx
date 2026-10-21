import { formatNombre } from "@/lib/format";

type Props = {
  /** Niveau affiché, déjà ramené à 0 s'il était négatif */
  niveauCm: number;
  /** Hauteur utile du bac : distance capteur - fond à vide */
  hauteurCm: number;
  seuilCm: number | null;
};

/** Réservoir vertical qui se remplit, avec la ligne du seuil d'alerte. */
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
      className="relative h-64 w-28 overflow-hidden rounded-md border-2 border-ink-2 bg-surface"
    >
      <div
        className={`absolute inset-x-0 bottom-0 transition-[height] duration-700 ${depasse ? "bg-prio-high" : "bg-water"}`}
        style={{ height: `${pct(niveauCm)}%`, opacity: depasse ? 0.85 : 0.55 }}
      />
      {seuilCm !== null && (
        <div className="absolute inset-x-0 border-t-2 border-dashed border-ink" style={{ bottom: `${pct(seuilCm)}%` }}>
          <span className="absolute right-1 -translate-y-full text-mention">Seuil {formatNombre(seuilCm)} cm</span>
        </div>
      )}
    </div>
  );
}
