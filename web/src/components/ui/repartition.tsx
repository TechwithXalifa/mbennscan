import { formatNombre } from "@/lib/format";

export type LigneRepartition = { cle: string; libelle: React.ReactNode; valeur: number; detail?: string };

/**
 * Répartition d'un total en quelques catégories : libellé, nombre, barre proportionnelle.
 * Barre neutre : la couleur de priorité ne sert qu'à la priorité.
 */
export function Repartition({
  titre,
  lignes,
  unite,
}: {
  titre: string;
  lignes: LigneRepartition[];
  /** « zones » : lu après chaque nombre par les lecteurs d'écran */
  unite: string;
}) {
  const total = lignes.reduce((s, l) => s + l.valeur, 0);
  return (
    <figure>
      <figcaption className="text-petit font-semibold text-ink">{titre}</figcaption>
      <ul className="mt-2 space-y-2">
        {lignes.map((l) => {
          const part = total > 0 ? l.valeur / total : 0;
          return (
            <li key={l.cle}>
              <div className="flex items-center justify-between gap-3 text-petit">
                <span className="flex min-w-0 items-center gap-1.5 text-ink-2">{l.libelle}</span>
                <span className="tabular-nums text-ink">
                  {formatNombre(l.valeur)}
                  <span className="sr-only"> {unite}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                <div
                  className="h-full rounded-pill bg-ink-3 transition-[width] duration-chiffre ease-sortie"
                  style={{ width: `${Math.round(part * 100)}%` }}
                />
              </div>
              {l.detail && <p className="mt-0.5 text-mention font-normal text-ink-3">{l.detail}</p>}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
