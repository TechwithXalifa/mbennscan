import { Bouton } from "@/components/ui/bouton";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";
import { cn } from "@/lib/utils";

export type EtatFond = "chargement" | "pret" | "lent" | "erreur";

/**
 * Chargement du fond de carte, puis, s'il tarde ou échoue : ce qui se passe et deux issues
 * (réessayer, ou continuer sans fond). Jamais de chargement sans fin.
 */
export function EtatFondCarte({
  etat,
  prete,
  onReessayer,
  onSansFond,
}: {
  etat: EtatFond;
  /** Les couches sont déjà dessinées (changement de thème ou de fond en cours) */
  prete: boolean;
  onReessayer: () => void;
  onSansFond: () => void;
}) {
  if (etat === "pret") return null;
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center",
        prete ? "pointer-events-none bg-transparent" : "bg-surface-3",
      )}
    >
      {etat === "chargement" && !prete && (
        <>
          <ChargeurGoutte libelle="Chargement du fond de carte" />
          <p className="text-petit text-ink-2" aria-hidden>
            Chargement du fond de carte…
          </p>
        </>
      )}
      {(etat === "lent" || etat === "erreur") && (
        <div
          role="alert"
          className="pointer-events-auto max-w-sm rounded-lg border border-line bg-surface p-4 shadow-pop"
        >
          <p className="font-semibold">
            {etat === "lent" ? "Le fond de carte tarde à venir" : "Le fond de carte n'a pas pu être chargé"}
          </p>
          <p className="mt-1 text-petit text-ink-2">
            Les zones restent consultables dans la liste. Vous pouvez réessayer, ou afficher les zones sans fond de
            carte.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Bouton taille="compacte" onClick={onReessayer}>
              Réessayer
            </Bouton>
            <Bouton taille="compacte" variante="secondaire" onClick={onSansFond}>
              Continuer sans fond
            </Bouton>
          </div>
        </div>
      )}
    </div>
  );
}
