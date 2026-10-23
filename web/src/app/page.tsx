import { Suspense } from "react";
import { VueCarte } from "@/components/carte/vue-carte";
import { ChargeurGoutte } from "@/components/ui/chargeur-goutte";

// E1 · Vue générale « Avant la saison ». La zone choisie est lue dans l'adresse (« /?zone=… »),
// d'où la limite de Suspense : la page reste statique, la vue se construit dans le navigateur.
export default function Accueil() {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div className="grid flex-1 place-items-center bg-surface-3">
            <ChargeurGoutte libelle="Chargement de la carte" />
          </div>
        }
      >
        <VueCarte />
      </Suspense>
    </main>
  );
}
