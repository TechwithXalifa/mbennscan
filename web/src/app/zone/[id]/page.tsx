import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FicheZone } from "@/components/zone/fiche-zone";
import { ICONE_PETITE } from "@/lib/design";

// E2 · Fiche zone, en page partageable et imprimable sur une page A4.
export default function PageZone({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { imprimer?: string };
}) {
  const id = decodeURIComponent(params.id);
  return (
    <main className="halo-entete flex-1 px-4 py-6 lg:px-8 lg:py-8 print:p-0">
      <div className="mx-auto max-w-3xl xl:max-w-6xl print:max-w-none">
        <nav aria-label="Retour" className="mb-4 flex flex-wrap gap-x-4 print:hidden">
          <Link
            href={`/?zone=${encodeURIComponent(id)}`}
            className="inline-flex min-h-cible items-center gap-1.5 text-petit font-medium text-primary-ink"
          >
            <ArrowLeft {...ICONE_PETITE} aria-hidden />
            Carte
          </Link>
          <Link href="/zones" className="inline-flex min-h-cible items-center text-petit font-medium text-primary-ink">
            Zones prioritaires
          </Link>
        </nav>
        <div className="rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-8 print:border-0 print:p-0 print:shadow-none">
          <FicheZone id={id} autonome imprimerAuChargement={searchParams.imprimer === "1"} />
        </div>
        <p className="hidden text-mention print:block">MbënnScan · © OpenStreetMap, Copernicus Sentinel, WorldPop</p>
      </div>
    </main>
  );
}
