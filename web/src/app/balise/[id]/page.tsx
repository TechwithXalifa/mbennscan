import { VueBalise } from "@/components/balise/vue-balise";

// E5 · Balise : niveau du bac en direct, courbe, état et mode présentation en plein écran.
export default function PageBalise({ params }: { params: { id: string } }) {
  return (
    <main className="halo-entete flex-1 px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <VueBalise id={decodeURIComponent(params.id)} />
      </div>
    </main>
  );
}
