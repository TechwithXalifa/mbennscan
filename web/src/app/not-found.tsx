import { Compass } from "lucide-react";
import Link from "next/link";
import { styleBouton } from "@/components/ui/bouton";

export default function PageIntrouvable() {
  return (
    <main className="halo-entete grid flex-1 place-items-center px-4 py-12">
      <div className="max-w-md text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-pill bg-surface-3 text-ink-3">
          <Compass size={24} strokeWidth={1.75} aria-hidden />
        </span>
        <p className="mt-4 text-surtitre uppercase text-ink-3">Erreur 404</p>
        <h1 className="mt-1 text-titre1 text-ink">Cette page n&apos;existe pas</h1>
        <p className="mt-2 text-ink-2">
          Le lien est peut-être ancien ou incomplet. Les zones et les épisodes restent accessibles depuis la vue
          générale.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className={styleBouton()}>
            Vue générale
          </Link>
          <Link href="/zones" className={styleBouton({ variante: "secondaire" })}>
            Zones prioritaires
          </Link>
        </div>
      </div>
    </main>
  );
}
