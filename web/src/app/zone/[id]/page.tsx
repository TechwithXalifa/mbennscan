import Link from "next/link";
import { FicheZone } from "@/components/zone/fiche-zone";

// E2 · Fiche zone, en page partageable. L'ouverture dans le panneau de la carte suit dans une autre PR.
export default function PageZone({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto min-h-dvh max-w-[680px] bg-surface px-4 py-6">
      <Link href="/" className="inline-flex min-h-cible items-center text-petit text-primary">
        ← Carte
      </Link>
      <FicheZone id={decodeURIComponent(params.id)} />
    </main>
  );
}
