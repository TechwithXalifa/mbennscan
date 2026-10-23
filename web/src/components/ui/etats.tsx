import { CircleAlert, Clock, FlaskConical, Inbox, WifiOff, type LucideIcon } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ICONE, ICONE_PETITE } from "@/lib/design";
import { cn } from "@/lib/utils";

/**
 * Erreur : ce qui s'est passé, ce qu'on peut faire, et « Réessayer ».
 * Les données déjà chargées restent affichées à côté.
 */
export function AlerteErreur({
  titre = "Chargement impossible",
  message,
  onReessayer,
  flottant = false,
  className,
}: {
  titre?: string;
  message: string;
  onReessayer?: () => void;
  /** Posée sur la carte */
  flottant?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        flottant ? "verre border-transparent" : "border-line bg-surface",
        className,
      )}
    >
      <CircleAlert {...ICONE} className="mt-0.5 shrink-0 text-danger" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{titre}</p>
        <p className="mt-0.5 break-words text-petit text-ink-2">{message}</p>
        <p className="mt-0.5 text-petit text-ink-2">
          Vérifiez la connexion, puis réessayez. Les informations déjà affichées restent valables.
        </p>
        {onReessayer && (
          <Bouton taille="compacte" variante="secondaire" onClick={onReessayer} className="mt-3">
            Réessayer
          </Bouton>
        )}
      </div>
    </div>
  );
}

/** État vide : une phrase qui dit ce qui se passe et pourquoi, jamais un tableau vide. */
export function EtatVide({
  titre,
  children,
  icone: Icone = Inbox,
  action,
  className,
}: {
  titre?: string;
  children: React.ReactNode;
  icone?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-4 py-6 text-center",
        className,
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-pill bg-surface-3 text-ink-3">
        <Icone {...ICONE} aria-hidden />
      </span>
      {titre && <p className="font-semibold text-ink">{titre}</p>}
      <div className="max-w-sm text-petit text-ink-2">{children}</div>
      {action}
    </div>
  );
}

/**
 * Bandeau de fraîcheur (« Image radar Sentinel-1 du 6 octobre 2026 ») ou hors ligne.
 * `ancien` : la donnée date ; le bandeau le dit avec une horloge, sans couleur d'alerte.
 */
export function Bandeau({
  horsLigne = false,
  ancien = false,
  icone,
  className,
  children,
}: {
  horsLigne?: boolean;
  ancien?: boolean;
  icone?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  const Icone = icone ?? (horsLigne ? WifiOff : ancien ? Clock : null);
  return (
    <p
      role={horsLigne ? "status" : undefined}
      className={cn(
        "flex items-start gap-2 rounded-md px-3 py-2 text-petit",
        horsLigne ? "bg-inverse text-inverse-ink" : "border border-line bg-surface-2 text-ink-2",
        className,
      )}
    >
      {Icone && <Icone {...ICONE_PETITE} className="mt-0.5 shrink-0" aria-hidden />}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/**
 * Maquette : zones et chiffres inventés pour montrer l'outil. Toujours visible, pour qu'aucun lecteur
 * ne prenne ces chiffres pour des résultats (guide du défi, règle n° 2).
 * `compact` : une ligne sur la carte d'un téléphone, la phrase complète reste lue par les lecteurs d'écran.
 */
export function BandeauMaquette({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <p
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-md border border-bandeau-line bg-bandeau px-3 py-2 text-petit text-bandeau-ink shadow-float print:border print:border-ink print:bg-transparent print:text-ink print:shadow-none",
        className,
      )}
    >
      <FlaskConical {...ICONE_PETITE} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Maquette :</strong> zones et chiffres fictifs.{" "}
        <span className={cn(compact && "sr-only sm:not-sr-only")}>
          Les résultats réels sont dans la note de concept.
        </span>
      </span>
    </p>
  );
}

/** État de la balise, dit en toutes lettres (« En ligne », « Muette ») : pas de pastille de couleur. */
export function EtatBalise({ enLigne, children }: { enLigne: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-petit" data-en-ligne={enLigne}>
      {children}
    </span>
  );
}
