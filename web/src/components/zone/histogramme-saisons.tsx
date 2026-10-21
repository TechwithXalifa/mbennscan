"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { formatNombre, formatPourcent } from "@/lib/format";
import type { IndicateurSaison } from "@/types/contracts";

type Mesure = "habitants" | "frequence";

const LIBELLES: Record<Mesure, string> = { habitants: "Habitants-jours", frequence: "Fréquence" };

/** Barres 2020 à 2026 ; une année sans image valide est hachurée (« données insuffisantes »). */
export default function HistogrammeSaisons({ saisons }: { saisons: IndicateurSaison[] }) {
  const [mesure, setMesure] = useState<Mesure>("habitants");

  const valeurs = saisons.map((s) => (mesure === "habitants" ? s.habitants_jours : s.frequence));
  const max = Math.max(1e-9, ...valeurs.map((v) => v ?? 0));
  const donnees = saisons.map((s, i) => {
    const manquante = s.images_valides === 0 || valeurs[i] === null;
    return {
      annee: String(s.annee),
      // Une année manquante occupe toute la hauteur, hachurée, pour ne pas ressembler à « zéro ».
      hauteur: manquante ? max : (valeurs[i] ?? 0),
      etiquette: manquante
        ? "n.d."
        : mesure === "habitants"
          ? formatNombre(Math.round(valeurs[i] ?? 0))
          : formatPourcent(valeurs[i] ?? 0),
      manquante,
    };
  });
  const manquantes = donnees.filter((d) => d.manquante).map((d) => d.annee);

  return (
    <figure>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-titre2">Hivernages 2020-2026</figcaption>
        <div className="inline-flex rounded-sm border border-line p-0.5" role="group" aria-label="Valeur affichée">
          {(Object.keys(LIBELLES) as Mesure[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mesure === m}
              onClick={() => setMesure(m)}
              className="min-h-cible whitespace-nowrap rounded-sm px-3 text-petit aria-pressed:bg-primary aria-pressed:text-surface"
            >
              {LIBELLES[m]}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 h-48" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={donnees} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <pattern
                id="hachures-saison"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill="var(--bg)" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--off)" strokeWidth="2" />
              </pattern>
            </defs>
            <XAxis dataKey="annee" tickLine={false} axisLine={{ stroke: "var(--line)" }} tick={{ fontSize: 12 }} />
            <Bar dataKey="hauteur" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {donnees.map((d) => (
                <Cell key={d.annee} fill={d.manquante ? "url(#hachures-saison)" : "var(--primary)"} />
              ))}
              <LabelList dataKey="etiquette" position="top" fontSize={12} fill="var(--ink)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Alternative lisible au graphique */}
      <ul className="sr-only">
        {donnees.map((d) => (
          <li key={d.annee}>
            {d.annee} : {d.manquante ? "données insuffisantes" : d.etiquette}
          </li>
        ))}
      </ul>
      {manquantes.length > 0 && (
        <p className="mt-1 text-petit text-ink-2">
          {manquantes.join(", ")} : données insuffisantes (aucune image radar exploitable).
        </p>
      )}
    </figure>
  );
}
