import Link from "next/link";
import { FicheZone } from "@/components/zone/fiche-zone";

// E2 · Fiche zone, en page partageable et imprimable sur une page A4.
export default function PageZone({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { imprimer?: string };
}) {
  return (
    <main className="mx-auto max-w-[680px] bg-surface px-4 py-6 print:max-w-none print:p-0">
      <Link href="/" className="inline-flex min-h-cible items-center text-petit text-primary print:hidden">
        ← Carte
      </Link>
      <FicheZone id={decodeURIComponent(params.id)} autonome imprimerAuChargement={searchParams.imprimer === "1"} />
      <p className="hidden text-mention print:block">MbënnScan · © OpenStreetMap, Copernicus Sentinel, WorldPop</p>
    </main>
  );
}
