"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ControleSegmente } from "@/components/ui/controle-segmente";
import type { Mesure } from "@/types/contracts";

type Fenetre = "1h" | "24h";
const DUREE_MS: Record<Fenetre, number> = { "1h": 3_600_000, "24h": 86_400_000 };
const TROU_MS = 120_000;
const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Courbe du niveau sur la dernière heure, bascule vers 24 heures. */
export default function CourbeNiveau({
  mesures,
  seuilCm,
  maintenant,
}: {
  mesures: Mesure[];
  seuilCm: number | null;
  maintenant: number;
}) {
  const [fenetre, setFenetre] = useState<Fenetre>("1h");
  const debut = maintenant - DUREE_MS[fenetre];
  const points = mesures
    .map((m) => ({ t: Date.parse(m.ts), niveau: m.niveau_cm === null ? null : Math.max(0, m.niveau_cm) }))
    .filter((p) => p.t >= debut)
    .sort((a, b) => a.t - b.t)
    // Balise muette plus de 2 minutes : la courbe s'interrompt au lieu de relier les deux mesures.
    .flatMap((p, i, tous) =>
      i > 0 && p.t - tous[i - 1].t > TROU_MS ? [{ t: tous[i - 1].t + 1, niveau: null }, p] : [p],
    );

  return (
    <figure className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-titre3">Niveau dans le temps</figcaption>
        <ControleSegmente
          libelle="Période"
          segments={[
            { valeur: "1h", libelle: "1 heure" },
            { valeur: "24h", libelle: "24 heures" },
          ]}
          valeur={fenetre}
          onChange={setFenetre}
        />
      </div>
      {points.length < 2 ? (
        <p className="mt-2 text-petit text-ink-2">Pas assez de mesures sur cette période pour tracer la courbe.</p>
      ) : (
        <div className="mt-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={[debut, maintenant]}
                tickFormatter={(t: number) => heure.format(t)}
                tick={{ fontSize: 12 }}
                stroke="var(--ink-2)"
              />
              <YAxis unit=" cm" tick={{ fontSize: 12 }} stroke="var(--ink-2)" allowDecimals={false} />
              <Tooltip
                labelFormatter={(t) => heure.format(Number(t))}
                formatter={(v) => [`${Math.round(Number(v))} cm`, "Niveau"]}
              />
              {seuilCm !== null && <ReferenceLine y={seuilCm} stroke="var(--ink)" strokeDasharray="4 4" />}
              <Line dataKey="niveau" stroke="var(--water-line)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </figure>
  );
}
