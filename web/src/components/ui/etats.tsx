import { WifiOff } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ICONE } from "@/lib/design";
import { cn } from "@/lib/utils";

/** Erreur réseau : message et « Réessayer » ; les données déjà chargées restent affichées. */
export function AlerteErreur({ message, onReessayer }: { message: string; onReessayer: () => void }) {
  return (
    <div role="alert">
      <p>{message}</p>
      <Bouton onClick={onReessayer} className="mt-2">
        Réessayer
      </Bouton>
    </div>
  );
}

/** État vide : une phrase qui dit ce qui se passe, jamais un tableau vide. */
export function EtatVide({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-dashed border-line p-4 text-center text-ink-2">{children}</p>;
}

/** Bandeau de fraîcheur (« Image radar Sentinel-1 du 6 octobre 2026 ») ou hors ligne. */
export function Bandeau({
  horsLigne = false,
  className,
  children,
}: {
  horsLigne?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      role={horsLigne ? "status" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-sm px-3 py-2 text-petit",
        horsLigne ? "bg-ink text-on-color" : "bg-bg text-ink-2",
        className,
      )}
    >
      {horsLigne && <WifiOff {...ICONE} aria-hidden />}
      {children}
    </p>
  );
}

/** Pastille d'état de la balise, toujours accompagnée de son texte. */
export function PastilleEtat({ enLigne, children }: { enLigne: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-petit">
      <span className={cn("relative size-2.5 rounded-pill", enLigne ? "bg-ok" : "bg-off")} aria-hidden>
        {/* Onde douce tant que la balise répond */}
        {enLigne && <span className="absolute inset-0 animate-onde rounded-pill bg-ok" />}
      </span>
      {children}
    </span>
  );
}
