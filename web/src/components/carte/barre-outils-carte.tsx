"use client";

import { Layers, LocateFixed, Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Interrupteur } from "@/components/ui/interrupteur";
import { Popover } from "@/components/ui/popover";
import type { Couches } from "@/lib/carte";
import { ICONE_PETITE } from "@/lib/design";

type Props = {
  onZoomer: (sens: 1 | -1) => void;
  onRecentrer: () => void;
  /** Élément mis en plein écran (la carte et ce qui flotte dessus) */
  cible: () => HTMLElement | null;
  /** Écran Après une pluie : la couche de l'eau remplace celle de la priorité */
  contour: boolean;
  couches: Couches;
  onCouches: (couches: Couches) => void;
  eauDisponible: boolean;
  sansFond: boolean;
  onFond: (sans: boolean) => void;
};

/** Commandes flottantes de la carte, en verre : zoom, vue d'ensemble, plein écran, couches et fond. */
export function BarreOutilsCarte({
  onZoomer,
  onRecentrer,
  cible,
  contour,
  couches,
  onCouches,
  eauDisponible,
  sansFond,
  onFond,
}: Props) {
  const [pleinEcran, setPleinEcran] = useState(false);
  const [pleinEcranPossible, setPleinEcranPossible] = useState(false);

  useEffect(() => {
    setPleinEcranPossible(Boolean(document.fullscreenEnabled));
    const suivre = () => setPleinEcran(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", suivre);
    return () => document.removeEventListener("fullscreenchange", suivre);
  }, []);

  function basculerPleinEcran() {
    const el = cible();
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen().catch(() => setPleinEcranPossible(false));
  }

  return (
    <div className="absolute right-3 top-3 z-controle flex flex-col gap-2 print:hidden">
      {/* Au doigt, on zoome en pinçant : les boutons + et − ne servent qu'à la souris et au clavier. */}
      <div className="verre flex flex-col rounded-md p-1 [@media(pointer:coarse)]:hidden">
        <button type="button" className="verre-bouton" onClick={() => onZoomer(1)} aria-label="Zoomer" title="Zoomer">
          <Plus {...ICONE_PETITE} aria-hidden />
        </button>
        <span className="mx-1.5 h-px bg-line" aria-hidden />
        <button
          type="button"
          className="verre-bouton"
          onClick={() => onZoomer(-1)}
          aria-label="Dézoomer"
          title="Dézoomer"
        >
          <Minus {...ICONE_PETITE} aria-hidden />
        </button>
      </div>
      <div className="verre flex flex-col gap-0.5 rounded-md p-1">
        <button
          type="button"
          className="verre-bouton"
          onClick={onRecentrer}
          aria-label="Revenir à la vue d'ensemble"
          title="Revenir à la vue d'ensemble"
        >
          <LocateFixed {...ICONE_PETITE} aria-hidden />
        </button>
        {pleinEcranPossible && (
          <button
            type="button"
            className="verre-bouton"
            onClick={basculerPleinEcran}
            aria-pressed={pleinEcran}
            aria-label={pleinEcran ? "Quitter le plein écran" : "Afficher la carte en plein écran"}
            title={pleinEcran ? "Quitter le plein écran" : "Plein écran"}
          >
            {pleinEcran ? <Minimize2 {...ICONE_PETITE} aria-hidden /> : <Maximize2 {...ICONE_PETITE} aria-hidden />}
          </button>
        )}
        <Popover
          libelle="Couches de la carte"
          position="gauche"
          classeBouton="verre-bouton"
          contenuBouton={<Layers {...ICONE_PETITE} aria-hidden />}
          className="w-72"
        >
          <p className="px-1 text-surtitre uppercase text-ink-3">Couches</p>
          <div className="mt-1">
            {!contour && (
              <Interrupteur
                actif={couches.priorite}
                onChange={(v) => onCouches({ ...couches, priorite: v })}
                libelle="Priorité des zones"
                detail="Couleur selon les habitants-jours sous l'eau"
              />
            )}
            <Interrupteur
              actif={couches.confiance}
              onChange={(v) => onCouches({ ...couches, confiance: v })}
              libelle="Confiance de la mesure"
              detail="Hachures et contour en pointillés"
            />
            {contour && (
              <Interrupteur
                actif={couches.eau}
                onChange={(v) => onCouches({ ...couches, eau: v })}
                libelle="Eau détectée"
                detail={eauDisponible ? "Image radar de l'épisode" : "Pas d'eau détectée sur cet épisode"}
                disabled={!eauDisponible}
              />
            )}
          </div>
          <p className="mt-3 border-t border-line px-1 pt-3 text-surtitre uppercase text-ink-3">Fond de carte</p>
          <div role="radiogroup" aria-label="Fond de carte" className="mt-2 grid grid-cols-2 gap-2">
            {[
              { sans: false, nom: "Plan", detail: "Rues et lieux" },
              { sans: true, nom: "Aucun", detail: "Zones seules" },
            ].map((o) => (
              <button
                key={o.nom}
                type="button"
                role="radio"
                aria-checked={sansFond === o.sans}
                onClick={() => onFond(o.sans)}
                className="min-h-cible rounded-md border border-line px-3 py-2 text-left transition-colors hover:border-line-strong aria-checked:border-primary aria-checked:bg-primary-soft"
              >
                <span className="block text-petit font-medium text-ink">{o.nom}</span>
                <span className="block text-mention font-normal text-ink-3">{o.detail}</span>
              </button>
            ))}
          </div>
        </Popover>
      </div>
    </div>
  );
}
