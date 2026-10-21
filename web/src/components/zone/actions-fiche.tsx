"use client";

import { Printer, Share2 } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  nom: string;
  /** true sur la page /zone/[id] ; dans le panneau de la carte, l'impression ouvre cette page. */
  autonome: boolean;
};

const BOUTON = "inline-flex min-h-cible items-center gap-2 rounded-sm border border-line px-3 text-primary hover:bg-bg";

export function ActionsFiche({ id, nom, autonome }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const lien = `${window.location.origin}/zone/${encodeURIComponent(id)}`;

  async function partager() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `MbënnScan · ${nom}`, url: lien });
        return;
      }
      await navigator.clipboard.writeText(lien);
      setMessage("Lien copié.");
    } catch (e) {
      // Partage annulé par l'utilisateur : rien à signaler.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMessage(`Copiez ce lien : ${lien}`);
    }
  }

  function imprimer() {
    if (autonome) window.print();
    else window.open(`${lien}?imprimer=1`, "_blank", "noopener");
  }

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={partager} className={BOUTON}>
          <Share2 size={20} strokeWidth={1.75} aria-hidden />
          Partager
        </button>
        <button type="button" onClick={imprimer} className={BOUTON}>
          <Printer size={20} strokeWidth={1.75} aria-hidden />
          Imprimer la fiche
        </button>
      </div>
      <p className="mt-1 text-petit text-ink-2" role="status">
        {message}
      </p>
    </div>
  );
}
