import { formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** Niveau affiché, déjà ramené à 0 s'il était négatif */
  niveauCm: number;
  /** Hauteur utile du bac : distance capteur - fond à vide */
  hauteurCm: number;
  seuilCm: number | null;
  /** Aucune mesure : la scène est dessinée sans eau inventée */
  sansMesure?: boolean;
  className?: string;
};

// Échelle de la scène : 1 unité = 1 cm, le sol en bas. Repère humain : un adulte de 1,75 m.
const SOL = 330;
const HAUT_CM = 320;
const y = (cm: number) => SOL - Math.min(HAUT_CM, Math.max(0, cm));

/** Jusqu'où l'eau monterait sur un adulte de 1,75 m, en français courant. */
export function reperesCorps(cm: number): string {
  if (cm <= 0) return "Pas d'eau mesurée";
  if (cm < 15) return "L'eau arriverait aux chevilles d'un adulte";
  if (cm < 55) return "L'eau arriverait aux genoux d'un adulte";
  if (cm < 105) return "L'eau arriverait à la taille d'un adulte";
  if (cm < 140) return "L'eau arriverait à la poitrine d'un adulte";
  if (cm < 175) return "L'eau arriverait aux épaules d'un adulte";
  return "Un adulte serait entièrement submergé";
}

/**
 * Le niveau mesuré, rapporté à une maison et à un adulte : l'eau monte à l'échelle réelle
 * (1 cm de niveau = 1 cm sur la personne), pour se représenter les habitants dont la maison est inondée.
 * La ligne pointillée est le seuil d'alerte ; « Seuil dépassé » est écrit à côté.
 */
export function Jauge({ niveauCm, hauteurCm, seuilCm, sansMesure = false, className }: Props) {
  const depasse = !sansMesure && seuilCm !== null && niveauCm >= seuilCm;
  const encre = "var(--ink-2)";

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={hauteurCm}
      aria-valuenow={sansMesure ? undefined : niveauCm}
      aria-valuetext={
        sansMesure
          ? "aucune mesure"
          : `${formatNombre(Math.round(niveauCm))} cm${depasse ? ", seuil dépassé" : ""}. ${reperesCorps(niveauCm)}.`
      }
      aria-label="Niveau d'eau, rapporté à une maison et à un adulte"
      className={cn(
        "relative h-72 w-48 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-2 transition-colors duration-etat",
        depasse ? "border-danger" : "border-line",
        className,
      )}
    >
      <svg viewBox="0 0 200 340" preserveAspectRatio="xMidYMax meet" className="h-full w-full" aria-hidden>
        {/* Graduations tous les 50 cm */}
        {[50, 100, 150, 200, 250, 300].map((cm) => (
          <g key={cm}>
            <line x1="186" x2="200" y1={y(cm)} y2={y(cm)} stroke="var(--line-strong)" strokeWidth="1" />
            <text x="183" y={y(cm) + 3} textAnchor="end" fontSize="9" fill="var(--ink-3)">
              {cm}
            </text>
          </g>
        ))}

        {/* Maison */}
        <polygon
          points={`6,${y(230)} 64,${y(300)} 122,${y(230)}`}
          fill="var(--surface-3)"
          stroke="var(--line-strong)"
        />
        <rect x="16" y={y(230)} width="96" height="230" fill="var(--surface-3)" stroke="var(--line-strong)" />
        <rect x="52" y={y(200)} width="30" height="200" fill="var(--surface)" stroke="var(--line-strong)" />
        <rect x="24" y={y(170)} width="20" height="24" fill="var(--surface)" stroke="var(--line-strong)" />

        {/* Adulte de 1,75 m */}
        <g stroke={encre} strokeLinecap="round" fill="none">
          <circle cx="150" cy={y(162)} r="12" fill={encre} stroke="none" />
          <line x1="150" y1={y(146)} x2="150" y2={y(92)} strokeWidth="11" />
          <line x1="150" y1={y(140)} x2="134" y2={y(92)} strokeWidth="6" />
          <line x1="150" y1={y(140)} x2="166" y2={y(92)} strokeWidth="6" />
          <line x1="147" y1={y(92)} x2="141" y2={y(4)} strokeWidth="8" />
          <line x1="153" y1={y(92)} x2="159" y2={y(4)} strokeWidth="8" />
        </g>

        {/* Eau : par-dessus la scène, à la hauteur mesurée */}
        {!sansMesure && niveauCm > 0 && (
          <g>
            <rect
              x="0"
              y={y(niveauCm)}
              width="200"
              height={SOL - y(niveauCm)}
              fill="var(--water)"
              opacity={depasse ? 0.7 : 0.55}
              className="transition-[y,height] duration-700 ease-sortie"
            />
            <g className="vague">
              <path
                d={`M0 ${y(niveauCm)} ${Array.from({ length: 8 }, () => "q12.5 -5 25 0 t25 0").join(" ")} V${y(niveauCm) + 6} H0 Z`}
                fill="var(--water)"
                opacity={depasse ? 0.7 : 0.55}
              />
            </g>
          </g>
        )}

        {/* Sol */}
        <line x1="0" x2="200" y1={SOL} y2={SOL} stroke="var(--line-strong)" strokeWidth="2" />

        {/* Seuil d'alerte */}
        {seuilCm !== null && (
          <g>
            <line
              x1="0"
              x2="200"
              y1={y(seuilCm)}
              y2={y(seuilCm)}
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <rect x="4" y={y(seuilCm) - 9} width="74" height="16" rx="4" fill="var(--surface)" />
            <text x="41" y={y(seuilCm) + 3} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)">
              Seuil {formatNombre(seuilCm)} cm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
