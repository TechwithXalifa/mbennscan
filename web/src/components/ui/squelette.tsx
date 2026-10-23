import { cn } from "@/lib/utils";

/** Bloc gris aux formes du contenu attendu, traversé d'un reflet ; jamais un écran blanc. */
export function Squelette({ className }: { className?: string }) {
  return <div className={cn("squelette rounded-sm bg-surface-3", className)} aria-hidden />;
}

/** Lignes d'une liste de zones (rang, nom, valeur). */
export function SqueletteListe({ lignes = 4, libelle = "Chargement" }: { lignes?: number; libelle?: string }) {
  return (
    <div role="status" aria-busy="true" className="divide-y divide-line">
      <span className="sr-only">{libelle}</span>
      {Array.from({ length: lignes }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Squelette className="size-7 rounded-pill" />
          <div className="flex-1 space-y-2">
            <Squelette className="h-4 w-3/4" />
            <Squelette className="h-3 w-1/2" />
          </div>
          <Squelette className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Fiche : titre, badges, phrase, grille de chiffres, graphique. */
export function SqueletteFiche({ libelle = "Chargement de la fiche" }: { libelle?: string }) {
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <span className="sr-only">{libelle}</span>
      <div className="space-y-2">
        <Squelette className="h-8 w-2/3" />
        <Squelette className="h-4 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Squelette className="h-6 w-28 rounded-pill" />
          <Squelette className="h-6 w-32 rounded-pill" />
        </div>
      </div>
      <Squelette className="h-16" />
      <div className="grid grid-cols-2 gap-3">
        <Squelette className="col-span-2 h-28 rounded-lg" />
        <Squelette className="h-24 rounded-lg" />
        <Squelette className="h-24 rounded-lg" />
      </div>
      <Squelette className="h-48 rounded-lg" />
    </div>
  );
}
