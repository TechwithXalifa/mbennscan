"use client";

import { Check, CloudRain, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { styleBouton } from "@/components/ui/bouton";
import { ICONE_PETITE } from "@/lib/design";
import { formatDate } from "@/lib/format";
import type { Evenement } from "@/types/contracts";

type Props = {
  id: string;
  nom: string;
  /** true sur la page /zone/[id] ; dans le panneau de la carte, l'impression ouvre cette page. */
  autonome: boolean;
  /** Épisode de pluie le plus récent, pour le lien vers l'écran « Après une pluie » */
  pluie: Evenement | null;
};

const BOUTON = styleBouton({ variante: "secondaire", taille: "compacte" });

export function ActionsFiche({ id, nom, autonome, pluie }: Props) {
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null);
  const lien = `${window.location.origin}/zone/${encodeURIComponent(id)}`;

  async function partager() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `MbënnScan · ${nom}`, url: lien });
        return;
      }
      await navigator.clipboard.writeText(lien);
      setMessage({ texte: "Lien copié.", ok: true });
    } catch (e) {
      // Partage annulé par l'utilisateur : rien à signaler.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMessage({ texte: `Copiez ce lien : ${lien}`, ok: false });
    }
  }

  function imprimer() {
    if (autonome) window.print();
    else window.open(`${lien}?imprimer=1`, "_blank", "noopener");
  }

  return (
    <div className="border-t border-line pt-5 print:hidden">
      <div className="flex flex-wrap gap-2">
        {pluie && (
          <Link href={`/apres/${pluie.id}`} className={styleBouton({ taille: "compacte" })}>
            <CloudRain {...ICONE_PETITE} aria-hidden />
            Voir après la pluie du {formatDate(pluie.date_pluie)}
          </Link>
        )}
        <button type="button" onClick={partager} className={BOUTON}>
          <Share2 {...ICONE_PETITE} aria-hidden />
          Partager
        </button>
        <button type="button" onClick={imprimer} className={BOUTON}>
          <Printer {...ICONE_PETITE} aria-hidden />
          Imprimer la fiche
        </button>
      </div>
      <p className="mt-2 flex min-h-5 items-center gap-1.5 break-all text-petit text-ink-2" role="status">
        {message?.ok && <Check {...ICONE_PETITE} className="text-ok" aria-hidden />}
        {message?.texte}
      </p>
    </div>
  );
}
