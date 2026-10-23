"use client";

import { CalendarClock } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ControleSegmente } from "@/components/ui/controle-segmente";
import { ICONE_PETITE } from "@/lib/design";
import { formatNombre, formatPourcent } from "@/lib/format";
import type { IndicateurSaison } from "@/types/contracts";

type Mesure = "habitants" | "frequence";

const SEGMENTS: { valeur: Mesure; libelle: string }[] = [
  { valeur: "habitants", libelle: "Habitants-jours" },
  { valeur: "frequence", libelle: "Fréquence" },
];

type Point = {
  annee: string;
  hauteur: number;
  etiquette: string;
  manquante: boolean;
  images: number;
  inondees: number;
};

function Bulle({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-petit shadow-pop">
      <p className="font-semibold text-ink">Hivernage {p.annee}</p>
      {p.manquante ? (
        <p className="text-ink-2">Données insuffisantes : aucune image radar exploitable.</p>
      ) : (
        <>
          <p className="tabular-nums text-ink">{p.etiquette}</p>
          <p className="tabular-nums text-ink-3">
            {formatNombre(p.inondees)} image{p.inondees > 1 ? "s" : ""} avec eau sur {formatNombre(p.images)}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Barres 2020 à 2026, valeur écrite au-dessus ; une année sans image valide est hachurée (« données insuffisantes »),
 * pour ne pas ressembler à « zéro ». La ligne pointillée est la moyenne des années mesurées.
 */
export default function HistogrammeSaisons({ saisons }: { saisons: IndicateurSaison[] }) {
  const [mesure, setMesure] = useState<Mesure>("habitants");

  const valeurs = saisons.map((s) => (mesure === "habitants" ? s.habitants_jours : s.frequence));
  const mesurees = valeurs.filter((v, i): v is number => v !== null && saisons[i].images_valides > 0);
  const max = Math.max(1e-9, ...mesurees);
  const moyenne = mesurees.length ? mesurees.reduce((s, v) => s + v, 0) / mesurees.length : null;
  const format = (v: number) => (mesure === "habitants" ? formatNombre(Math.round(v)) : formatPourcent(v));
  const donnees: Point[] = saisons.map((s, i) => {
    const manquante = s.images_valides === 0 || valeurs[i] === null;
    return {
      annee: String(s.annee),
      // Une année manquante occupe toute la hauteur, hachurée, pour ne pas ressembler à « zéro ».
      hauteur: manquante ? max : (valeurs[i] ?? 0),
      etiquette: manquante ? "n.d." : format(valeurs[i] ?? 0),
      manquante,
      images: s.images_valides,
      inondees: s.images_inondees,
    };
  });
  const manquantes = donnees.filter((d) => d.manquante).map((d) => d.annee);

  return (
    <figure className="break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption>
          <span className="flex items-center gap-2 text-titre3 text-ink">
            <CalendarClock {...ICONE_PETITE} className="text-ink-3" aria-hidden />
            Hivernages 2020-2026
          </span>
          <span className="block text-petit text-ink-2">
            {mesure === "habitants" ? "Habitants-jours sous l'eau par hivernage" : "Part des passages avec de l'eau"}
          </span>
        </figcaption>
        <ControleSegmente
          compact
          libelle="Valeur affichée"
          segments={SEGMENTS}
          valeur={mesure}
          onChange={setMesure}
          className="print:hidden"
        />
      </div>
      <div className="mt-3 h-56 rounded-lg border border-line bg-surface px-2 pt-2" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={donnees} margin={{ top: 22, right: 8, bottom: 4, left: 0 }} accessibilityLayer={false}>
            <defs>
              <pattern
                id="hachures-saison"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill="var(--surface-2)" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--off)" strokeWidth="2" />
              </pattern>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="annee"
              tickLine={false}
              axisLine={{ stroke: "var(--line-strong)" }}
              tick={{ fontSize: 12, fill: "var(--ink-2)" }}
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--ink-3)" }}
              tickFormatter={(v: number) =>
                mesure === "habitants"
                  ? new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v)
                  : formatPourcent(v)
              }
              domain={[0, "auto"]}
            />
            <Tooltip content={<Bulle />} cursor={{ fill: "var(--surface-3)" }} />
            {moyenne !== null && (
              <ReferenceLine
                y={moyenne}
                stroke="var(--ink-2)"
                strokeDasharray="4 4"
                label={{ value: "moyenne", position: "insideTopRight", fontSize: 11, fill: "var(--ink-2)" }}
              />
            )}
            <Bar dataKey="hauteur" radius={[6, 6, 0, 0]} maxBarSize={40} isAnimationActive={false}>
              {donnees.map((d) => (
                <Cell key={d.annee} fill={d.manquante ? "url(#hachures-saison)" : "var(--primary)"} />
              ))}
              <LabelList dataKey="etiquette" position="top" fontSize={11} fill="var(--ink)" />
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
        {moyenne !== null && <li>Moyenne des années mesurées : {format(moyenne)}</li>}
      </ul>
      <p className="mt-2 text-petit text-ink-2">
        {manquantes.length > 0 && `${manquantes.join(", ")} : données insuffisantes (aucune image radar exploitable). `}
        Une baisse d&apos;une année à l&apos;autre peut venir de la pluie : elle ne prouve pas l&apos;effet d&apos;un
        ouvrage.
      </p>
    </figure>
  );
}
