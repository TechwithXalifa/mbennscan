"use client";

import { CloudOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";
import { AlerteErreur, EtatVide } from "@/components/ui/etats";
import { getEvenements } from "@/lib/data";

// /apres ouvre l'épisode le plus récent.
export default function DernierEpisode() {
  const router = useRouter();
  const [etat, setEtat] = useState<"chargement" | "vide" | { erreur: string }>("chargement");

  const charger = useCallback(() => {
    setEtat("chargement");
    getEvenements()
      .then((e) => (e[0] ? router.replace(`/apres/${e[0].id}`) : setEtat("vide")))
      .catch((e: unknown) => setEtat({ erreur: e instanceof Error ? e.message : String(e) }));
  }, [router]);

  useEffect(charger, [charger]);

  return (
    <main className="grid flex-1 place-items-center bg-surface-3 p-4">
      <h1 className="sr-only">Après une pluie</h1>
      {etat === "chargement" && (
        <div className="flex flex-col items-center gap-3">
          <ChargeurGoutte libelle="Chargement des épisodes" />
          <p className="text-petit text-ink-2" aria-hidden>
            Recherche du dernier épisode de pluie…
          </p>
        </div>
      )}
      {etat === "vide" && (
        <EtatVide titre="Aucun épisode de pluie calculé" icone={CloudOff} className="max-w-md bg-surface">
          Les épisodes de forte pluie apparaîtront ici dès que le traitement satellite en aura analysé un.
        </EtatVide>
      )}
      {typeof etat === "object" && (
        <AlerteErreur
          titre="Les épisodes n'ont pas pu être chargés"
          message={etat.erreur}
          onReessayer={charger}
          className="max-w-md"
        />
      )}
    </main>
  );
}
