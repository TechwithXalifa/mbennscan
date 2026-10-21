import { Infobulle } from "@/components/ui/infobulle";

/** Carte de chiffre clé : valeur en grand, intitulé, phrase d'explication, « i » facultatif. */
export function ChiffreCle({
  valeur,
  intitule,
  phrase,
  info,
  mot = false,
}: {
  valeur: string;
  intitule: string;
  phrase: string;
  info?: React.ReactNode;
  /** Valeur en toutes lettres (type d'eau) : écrite plus petit pour tenir sur mobile. */
  mot?: boolean;
}) {
  return (
    <div className="rounded-md border border-line p-3">
      <div className="flex items-start justify-between gap-2">
        <p className={mot ? "text-titre2" : "text-chiffre tabular-nums"}>{valeur}</p>
        {info && <Infobulle libelle={`À propos : ${intitule}`}>{info}</Infobulle>}
      </div>
      <p className="text-titre3">{intitule}</p>
      <p className="text-petit text-ink-2">{phrase}</p>
    </div>
  );
}
