"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChiffreCle } from "@/components/ui/chiffre-cle";
import { Compteur } from "@/components/ui/compteur";
import { ActionsFiche } from "@/components/zone/actions-fiche";
import { BadgePriorite, IndicateurConfiance } from "@/components/zone/badges";
import { getZoneDetail, getZones, USE_MOCKS } from "@/lib/data";
import { formatDate, formatNombre, formatPourcent } from "@/lib/format";
import { EXPLICATION_EAU, historique, LIBELLE_EAU, ordinal, phraseSynthese, SUGGESTION_EAU } from "@/lib/synthese";
import type { ZoneDetail } from "@/types/contracts";

// Recharts n'est chargé que lorsqu'une fiche avec historique s'affiche.
const HistogrammeSaisons = dynamic(() => import("@/components/zone/histogramme-saisons"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-sm bg-line" />,
});

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string }
  | { statut: "inconnue" }
  | { statut: "ok"; detail: ZoneDetail; total: number };

type Props = {
  id: string;
  /** Page /zone/[id] (et non panneau de la carte) */
  autonome?: boolean;
  /** Lance l'impression dès que la fiche est chargée (lien « Imprimer » depuis la carte) */
  imprimerAuChargement?: boolean;
};

export function FicheZone({ id, autonome = false, imprimerAuChargement = false }: Props) {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    Promise.all([getZoneDetail(id), getZones()])
      .then(([detail, zones]) =>
        setEtat(detail ? { statut: "ok", detail, total: zones.features.length } : { statut: "inconnue" }),
      )
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, [id]);

  useEffect(charger, [charger]);

  const pret = etat.statut === "ok";
  useEffect(() => {
    if (!pret || !imprimerAuChargement) return;
    // Laisse le temps à l'histogramme de s'afficher avant l'impression.
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, [pret, imprimerAuChargement]);

  if (etat.statut === "chargement") {
    return (
      <div className="space-y-3" aria-busy="true">
        {["h-8 w-2/3", "h-5 w-1/2", "h-20", "h-40"].map((c) => (
          <div key={c} className={`${c} animate-pulse rounded-sm bg-line`} />
        ))}
      </div>
    );
  }
  if (etat.statut === "erreur") {
    return (
      <div role="alert">
        <p>Impossible de charger la zone : {etat.message}</p>
        <button
          type="button"
          onClick={charger}
          className="mt-2 min-h-cible rounded-sm bg-primary px-4 text-surface hover:bg-primary-strong"
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (etat.statut === "inconnue") return <p>Zone « {id} » introuvable.</p>;

  const { zone, indicateurs_saison } = etat.detail;
  const h = historique(indicateurs_saison);

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-titre1">{zone.nom}</h1>
        <p className="text-ink-2">{zone.commune}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <BadgePriorite priorite={zone.priorite} />
          {zone.rang !== null && (
            <span className="text-petit">
              {ordinal(zone.rang)} sur {formatNombre(etat.total)} zones
            </span>
          )}
          <IndicateurConfiance confiance={zone.confiance} />
        </div>
      </header>

      <p>{phraseSynthese(zone, h)}</p>

      <div className="grid grid-cols-2 gap-3">
        <ChiffreCle
          valeur={<Compteur valeur={zone.habitants_jours_an} format={(n) => formatNombre(Math.round(n))} />}
          intitule="Habitants-jours par an"
          phrase="Habitants touchés × jours d'eau, en moyenne sur 2020-2026."
        />
        <ChiffreCle
          valeur={h?.frequence != null ? <Compteur valeur={h.frequence} format={formatPourcent} /> : "–"}
          intitule="Fréquence observée"
          phrase="Part des passages du satellite où l'eau était là."
        />
        <ChiffreCle
          valeur={
            h?.dureeMoyJours != null ? (
              <Compteur valeur={h.dureeMoyJours} format={(n) => `${formatNombre(Math.round(n))} j`} />
            ) : (
              "–"
            )
          }
          intitule="Durée moyenne"
          phrase="Combien de temps l'eau reste après une forte pluie."
        />
        <ChiffreCle
          mot={zone.classe_eau !== null}
          valeur={zone.classe_eau ? LIBELLE_EAU[zone.classe_eau] : "–"}
          intitule="Type d'eau"
          phrase={zone.classe_eau ? EXPLICATION_EAU[zone.classe_eau] : "Pas d'eau observée."}
        />
      </div>

      {indicateurs_saison.length > 0 && <HistogrammeSaisons saisons={indicateurs_saison} />}

      <section>
        <h2 className="text-titre2">Ce qui est touché</h2>
        <ul className="mt-2 space-y-1">
          <li>{formatNombre(zone.batiments_touches)} bâtiments</li>
          <li>
            {formatNombre(zone.ecoles_touchees)} école{zone.ecoles_touchees > 1 ? "s" : ""}
            {zone.ecoles_noms.length > 0 && ` : ${zone.ecoles_noms.join(", ")}`}
          </li>
          <li>{formatNombre(zone.routes_km)} km de routes</li>
        </ul>
      </section>

      {zone.classe_eau && (
        <section>
          <h2 className="text-titre2">Ce que ça suggère</h2>
          <p className="mt-2">{SUGGESTION_EAU[zone.classe_eau]}</p>
        </section>
      )}

      <section className="text-petit text-ink-2">
        <h2 className="text-titre3 text-ink">Fiabilité</h2>
        <p>
          {h
            ? `${formatNombre(h.imagesValides)} images radar exploitables sur 2020-2026. `
            : "Historique par hivernage non disponible. "}
          Calcul du {formatDate(zone.maj)}.
        </p>
        {zone.confiance === "faible" && <p>Mesure moins fiable : à vérifier sur le terrain.</p>}
        {zone.part_bati != null && <p>Part de bâti dans la zone : {formatPourcent(zone.part_bati)}.</p>}
        {USE_MOCKS && <p>Données factices [FICTIF].</p>}
        <Link href="/methode" className="mt-1 inline-flex min-h-cible items-center text-primary underline">
          Comment ces chiffres sont calculés
        </Link>
      </section>
      <ActionsFiche id={zone.id} nom={zone.nom} autonome={autonome} />
    </article>
  );
}
