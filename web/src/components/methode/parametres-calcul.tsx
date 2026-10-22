"use client";

import { useEffect, useState } from "react";
import { getRunMeta, USE_MOCKS } from "@/lib/data";
import { formatDate, formatNombre, formatPourcent } from "@/lib/format";
import type { RunMeta } from "@/types/contracts";

type Etat = { statut: "chargement" } | { statut: "absent" } | { statut: "erreur" } | { statut: "ok"; meta: RunMeta };

/** Paramètres du dernier calcul, lus dans run_meta.json, pour refaire le calcul à l'identique. */
export function ParametresCalcul() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });

  useEffect(() => {
    getRunMeta()
      .then((meta) => setEtat(meta ? { statut: "ok", meta } : { statut: "absent" }))
      .catch(() => setEtat({ statut: "erreur" }));
  }, []);

  if (etat.statut === "chargement") return <div className="h-48 animate-pulse rounded-sm bg-line" aria-busy="true" />;
  if (etat.statut === "absent")
    return <p>Les paramètres du calcul seront publiés avec les premiers résultats réels.</p>;
  if (etat.statut === "erreur") return <p role="alert">Impossible de charger les paramètres du calcul.</p>;

  const { meta } = etat;
  const p = meta.parametres;
  const lignes: [string, string][] = [
    ["Date du calcul", formatDate(meta.date_calcul)],
    ["Version du pipeline (commit)", meta.version_pipeline],
    ["Période analysée", `du ${formatDate(meta.periode.debut)} au ${formatDate(meta.periode.fin)}`],
    ["Zone d'étude (lon, lat)", meta.zone_etude_bbox.map((v) => formatNombre(v)).join(" ; ")],
    ["Épisode de forte pluie", `${formatNombre(p.seuil_pluie_mm)} mm ou plus en 24 h`],
    [
      "Seuil radar VV",
      `méthode d'Otsu bornée entre ${formatNombre(p.seuil_db_min)} et ${formatNombre(p.seuil_db_max)} dB (${formatNombre(p.seuil_db_defaut)} dB à défaut)`,
    ],
    ["Baisse minimale par rapport au sec", `${formatNombre(p.baisse_min_db)} dB`],
    ["Zone comptée inondée sur une image", `au moins ${formatPourcent(p.part_zone_inondee_min)} de sa surface en eau`],
    ["Grille de zones", `H3, résolution ${p.h3_resolution}`],
    [
      "Classes de persistance",
      `moins de ${p.persistance_courte_j} j, ${p.persistance_courte_j} à ${p.persistance_longue_j} j, ${p.persistance_longue_j} j ou plus`,
    ],
    ["Eau permanente masquée", `occurrence JRC supérieure à ${formatNombre(p.occurrence_eau_permanente_min)} %`],
    ["Pentes masquées", `plus de ${formatNombre(p.pente_max_deg)} degrés`],
    [
      "Taille minimale d'une étendue d'eau",
      `${formatNombre(p.taille_min_tache_px)} pixels de 10 m d'un seul tenant (${formatNombre(p.taille_min_tache_px / 100)} ha)`,
    ],
    ["Images Sentinel-1 utilisées", formatNombre(meta.images.length)],
  ];

  return (
    <div>
      <dl className="divide-y divide-line rounded-md border border-line">
        {lignes.map(([cle, valeur]) => (
          <div key={cle} className="grid gap-1 p-3 sm:grid-cols-2">
            <dt className="text-petit text-ink-2">{cle}</dt>
            <dd className="tabular-nums">{valeur}</dd>
          </div>
        ))}
      </dl>
      {USE_MOCKS && <p className="mt-2 text-mention text-ink-2">Paramètres du jeu de données factice [FICTIF].</p>}
    </div>
  );
}
