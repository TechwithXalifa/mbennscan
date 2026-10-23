"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ChoixTheme } from "@/components/shell/choix-theme";
import { Logo } from "@/components/shell/marque";
import { StatutDonnees } from "@/components/shell/statut-donnees";
import { Dialogue } from "@/components/ui/dialogue";
import { ICONE } from "@/lib/design";
import { GROUPES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Menu du téléphone et de la tablette : toutes les pages, le thème et la provenance des données. */
export function MenuMobile({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const chemin = usePathname();

  // Une page choisie ferme le menu.
  useEffect(() => {
    onFermer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chemin]);

  return (
    <Dialogue ouvert={ouvert} onFermer={onFermer} titre="Menu" variante="tiroir">
      <div className="flex h-topbar shrink-0 items-center justify-between border-b border-line px-4">
        <Logo />
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le menu"
          className="-mr-2 inline-flex size-cible items-center justify-center rounded-sm text-ink-2 hover:bg-surface-3 hover:text-ink"
        >
          <X {...ICONE} aria-hidden />
        </button>
      </div>
      <nav aria-label="Navigation principale" className="min-h-0 flex-1 overflow-y-auto p-3">
        {GROUPES.map((g) => (
          <div key={g.titre} className="mb-4">
            <p className="mb-1 px-3 text-surtitre uppercase text-ink-3">{g.titre}</p>
            <ul className="space-y-0.5">
              {g.liens.map(({ href, libelle, description, Icone, actif }) => {
                const courant = actif(chemin);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={courant ? "page" : undefined}
                      className={cn(
                        "flex min-h-cible items-start gap-3 rounded-md px-3 py-2.5 transition-colors",
                        courant ? "bg-primary-soft text-primary-ink" : "text-ink hover:bg-surface-3",
                      )}
                    >
                      <Icone {...ICONE} className="mt-0.5 shrink-0" aria-hidden />
                      <span>
                        <span className="block font-medium">{libelle}</span>
                        <span className="block text-petit text-ink-2">{description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-3 border-t border-line p-4">
        <StatutDonnees />
        <ChoixTheme avecLibelles />
      </div>
    </Dialogue>
  );
}
