import { VueApres } from "@/components/apres/vue-apres";

// E3 · « Après une pluie » : où l'eau est encore présente, et chez combien de personnes.
export default function PageApres({ params }: { params: { evenement: string } }) {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
      <VueApres evenementId={Number(params.evenement)} />
    </main>
  );
}
