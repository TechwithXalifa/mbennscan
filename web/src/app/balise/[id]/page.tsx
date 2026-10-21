import { VueBalise } from "@/components/balise/vue-balise";

// E5 · Balise : niveau du bac en direct. Courbe, mini-carte et plein écran dans une PR suivante.
export default function PageBalise({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-dvh px-4 py-6">
      <VueBalise id={decodeURIComponent(params.id)} />
    </main>
  );
}
