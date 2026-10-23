"use client";

import { Activity } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ControleSegmente } from "@/components/ui/controle-segmente";
import { EtatVide } from "@/components/ui/etats";
import { ICONE_PETITE } from "@/lib/design";
import { formatNombre } from "@/lib/format";
import type { Mesure } from "@/types/contracts";

type Fenetre = "1h" | "24h";
const DUREE_MS: Record<Fenetre, number> = { "1h": 3_600_000, "24h": 86_400_000 };
const TROU_MS = 120_000;
const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dateHeure = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function points(mesures: Mesure[], debut: number) {
  return (
    mesures
      .map((m) => ({ t: Date.parse(m.ts), niveau: m.niveau_cm === null ? null : Math.max(0, m.niveau_cm) }))
      .filter((p) => p.t >= debut)
      .sort((a, b) => a.t - b.t)
      // Balise muette plus de 2 minutes : la courbe s'interrompt au lieu de relier les deux mesures.
      .flatMap((p, i, tous) =>
        i > 0 && p.t - tous[i - 1].t > TROU_MS ? [{ t: tous[i - 1].t + 1, niveau: null }, p] : [p],
      )
  );
}

function Bulle({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { t: number; niveau: number | null } }[];
}) {
  const p = payload?.[0]?.payload;
  if (!active || !p || p.niveau === null) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-petit shadow-pop">
      <p className="tabular-nums text-ink-3">{heure.format(p.t)}</p>
      <p className="font-semibold tabular-nums text-ink">{formatNombre(Math.round(p.niveau))} cm</p>
    </div>
  );
}

/**
 * Courbe du niveau sur la dernière heure, bascule vers 24 heures.
 * À l'ouverture, la période qui contient des mesures est choisie (une balise muette depuis 2 h n'a rien sur 1 h).
 */
export default function CourbeNiveau({
  mesures,
  seuilCm,
  maintenant,
}: {
  mesures: Mesure[];
  seuilCm: number | null;
  maintenant: number;
}) {
  const [fenetre, setFenetre] = useState<Fenetre>(() =>
    points(mesures, maintenant - DUREE_MS["1h"]).length >= 2 ? "1h" : "24h",
  );
  const debut = maintenant - DUREE_MS[fenetre];
  const serie = points(mesures, debut);
  const derniere = mesures[0];

  return (
    <figure className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption>
          <span className="flex items-center gap-2 text-titre3 text-ink">
            <Activity {...ICONE_PETITE} className="text-ink-3" aria-hidden />
            Niveau dans le temps
          </span>
          <span className="block text-petit text-ink-2">
            {fenetre === "1h" ? "Dernière heure" : "Dernières 24 heures"} · en centimètres
          </span>
        </figcaption>
        <ControleSegmente
          compact
          libelle="Période"
          segments={[
            { valeur: "1h", libelle: "1 heure" },
            { valeur: "24h", libelle: "24 heures" },
          ]}
          valeur={fenetre}
          onChange={setFenetre}
        />
      </div>
      {serie.filter((p) => p.niveau !== null).length < 2 ? (
        <EtatVide titre="Pas assez de mesures sur cette période" className="mt-4 flex-1 justify-center">
          {derniere
            ? `La courbe demande au moins deux mesures. Dernière mesure reçue : ${dateHeure.format(Date.parse(derniere.ts))}.`
            : "Aucune mesure n'a encore été reçue de cette balise."}
        </EtatVide>
      ) : (
        <div className="mt-4 h-56 min-h-56 flex-1" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={[debut, maintenant]}
                tickFormatter={(t: number) => heure.format(t)}
                tick={{ fontSize: 11, fill: "var(--ink-3)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--line-strong)" }}
                minTickGap={24}
              />
              <YAxis
                unit=" cm"
                tick={{ fontSize: 11, fill: "var(--ink-3)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={56}
              />
              <Tooltip content={<Bulle />} cursor={{ stroke: "var(--line-strong)" }} />
              {seuilCm !== null && (
                <ReferenceLine
                  y={seuilCm}
                  stroke="var(--ink)"
                  strokeDasharray="4 4"
                  label={{ value: "seuil", position: "insideTopRight", fontSize: 11, fill: "var(--ink-2)" }}
                />
              )}
              <Line
                dataKey="niveau"
                stroke="var(--water-line)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--water-line)", stroke: "var(--surface)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Alternative lisible à la courbe */}
      <p className="sr-only">
        {serie.length} mesures sur la période
        {derniere?.niveau_cm != null && `, dernière à ${formatNombre(Math.round(Math.max(0, derniere.niveau_cm)))} cm`}.
      </p>
    </figure>
  );
}
