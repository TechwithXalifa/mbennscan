import { VueApres } from "@/components/apres/vue-apres";

// E3 · « Après une pluie » : où l'eau est encore présente, et chez combien de personnes.
export default function PageApres({ params }: { params: { evenement: string } }) {
  return (
    <main className="relative flex flex-1">
      <VueApres evenementId={Number(params.evenement)} />
    </main>
  );
}
