import Link from "next/link";
import { VueApres } from "@/components/apres/vue-apres";

// E3 · « Après une pluie » : où l'eau est encore présente, et chez combien de personnes.
export default function PageApres({ params }: { params: { evenement: string } }) {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-topbar shrink-0 items-center border-b border-line bg-surface px-4">
        <Link href="/" className="text-titre3">
          Mbënn<span className="text-primary">Scan</span>
        </Link>
      </header>
      <main className="relative flex flex-1">
        <VueApres evenementId={Number(params.evenement)} />
      </main>
    </div>
  );
}
