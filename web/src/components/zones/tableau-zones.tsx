"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, MapPin, SearchX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TYPE_EAU } from "@/components/liste-zones";
import { AlerteErreur, BandeauMaquette, EtatVide } from "@/components/ui/etats";
import { Squelette } from "@/components/ui/squelette";
import { BadgePriorite, IndicateurConfiance } from "@/components/zone/badges";
import { actifs, FiltresZones, FILTRES_VIDES, filtrer, type Filtres } from "@/components/zones/filtres-zones";
import { CartesZones } from "@/components/zones/cartes-zones";
import { comparer, NOM_COLONNE, type Colonne, type Tri } from "@/components/zones/tri-zones";
import { estMaquette, getZones } from "@/lib/data";
import { ICONE_PETITE } from "@/lib/design";
import { formatDate, formatHabitants, formatNombre } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ZoneSynthese } from "@/types/contracts";

type Etat = { statut: "chargement" } | { statut: "erreur"; message: string } | { statut: "ok"; zones: ZoneSynthese[] };

/** Classement complet des zones : recherche, filtres, tri. Chaque zone mène à sa fiche ou à la carte. */
export function TableauZones() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_VIDES);
  const [tri, setTri] = useState<Tri>({ colonne: "rang", sens: "asc" });

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    getZones()
      .then((z) => setEtat({ statut: "ok", zones: z.features.map((f) => f.properties) }))
      .catch((e: unknown) => setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) }));
  }, []);
  useEffect(charger, [charger]);

  const zones = useMemo(() => (etat.statut === "ok" ? etat.zones : []), [etat]);
  const communes = useMemo(
    () => Array.from(new Set(zones.map((z) => z.commune))).sort((a, b) => a.localeCompare(b, "fr")),
    [zones],
  );
  const max = Math.max(1, ...zones.map((z) => z.habitants_jours_an));
  const filtrees = useMemo(() => filtrer(zones, filtres).sort((a, b) => comparer(a, b, tri)), [zones, filtres, tri]);
  const filtresActifs = actifs(filtres);
  const maquette = estMaquette(zones.map((z) => z.nom));
  const maj = zones
    .map((z) => z.maj)
    .sort()
    .at(-1);

  const reinitialiser = () => setFiltres(FILTRES_VIDES);

  function trier(colonne: Colonne) {
    setTri((t) =>
      t.colonne === colonne
        ? { colonne, sens: t.sens === "asc" ? "desc" : "asc" }
        : { colonne, sens: colonne === "habitants_jours_an" || colonne === "population" ? "desc" : "asc" },
    );
  }

  function Entete({
    colonne,
    children,
    droite = false,
  }: {
    colonne: Colonne;
    children: React.ReactNode;
    droite?: boolean;
  }) {
    const actif = tri.colonne === colonne;
    const Icone = !actif ? ArrowUpDown : tri.sens === "asc" ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={actif ? (tri.sens === "asc" ? "ascending" : "descending") : "none"}
        className={cn("whitespace-nowrap px-3 py-0 font-medium", droite && "text-right")}
      >
        <button
          type="button"
          onClick={() => trier(colonne)}
          className={cn(
            "inline-flex min-h-10 items-center gap-1 rounded-sm text-petit transition-colors hover:text-ink",
            actif ? "text-ink" : "text-ink-2",
            droite && "flex-row-reverse",
          )}
        >
          {children}
          <Icone {...ICONE_PETITE} className={cn("shrink-0", actif ? "text-ink" : "text-ink-3")} aria-hidden />
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-surtitre uppercase text-ink-3">Avant la saison</p>
          <h1 className="mt-1 text-titre1 text-ink">Zones prioritaires</h1>
          <p className="mt-1 text-ink-2">
            Toutes les zones calculées, classées selon les habitants-jours sous l&apos;eau des hivernages 2020-2026. Les
            zones où l&apos;eau a été vue sont réparties en trois tiers : priorité forte, moyenne, faible.
          </p>
        </div>
        {etat.statut === "ok" && !maquette && maj && <p className="puce shrink-0">Calcul du {formatDate(maj)}</p>}
      </header>

      {maquette && <BandeauMaquette />}

      <FiltresZones filtres={filtres} onChange={setFiltres} communes={communes} />

      {etat.statut === "erreur" && (
        <AlerteErreur titre="Le classement n'a pas pu être chargé" message={etat.message} onReessayer={charger} />
      )}

      {etat.statut === "chargement" && (
        <div role="status" aria-busy="true" className="space-y-2 rounded-lg border border-line bg-surface p-4">
          <span className="sr-only">Chargement du classement</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <Squelette key={i} className="h-12" />
          ))}
        </div>
      )}

      {etat.statut === "ok" && (
        <>
          <p className="text-petit text-ink-2" role="status">
            {formatNombre(filtrees.length)} zone{filtrees.length > 1 ? "s" : ""}
            {filtresActifs && ` sur ${formatNombre(zones.length)}`}
          </p>

          {filtrees.length === 0 ? (
            <EtatVide
              titre={zones.length === 0 ? "Aucune zone calculée" : "Aucune zone ne correspond"}
              icone={SearchX}
              action={
                filtresActifs && (
                  <button
                    type="button"
                    onClick={reinitialiser}
                    className="min-h-cible text-petit font-medium text-primary-ink underline-offset-4 hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                )
              }
            >
              {zones.length === 0
                ? "Le classement apparaîtra dès que le traitement satellite aura publié ses premiers résultats."
                : "Essayez un autre nom, ou retirez un filtre de priorité, de commune ou de confiance."}
            </EtatVide>
          ) : (
            <>
              {/* Ordinateur : tableau */}
              <div className="hidden overflow-hidden rounded-lg border border-line bg-surface shadow-1 lg:block">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">
                    Classement des zones, trié par {NOM_COLONNE[tri.colonne]}
                    {tri.sens === "asc" ? " croissant" : " décroissant"}
                  </caption>
                  <thead className="border-b border-line bg-surface-2">
                    <tr>
                      <Entete colonne="rang">Rang</Entete>
                      <Entete colonne="nom">Zone</Entete>
                      <th scope="col" className="px-3 text-petit font-medium text-ink-2">
                        Priorité
                      </th>
                      <Entete colonne="habitants_jours_an" droite>
                        Habitants-jours / an
                      </Entete>
                      <th scope="col" className="hidden px-3 text-petit font-medium text-ink-2 xl:table-cell">
                        Type d&apos;eau
                      </th>
                      <Entete colonne="confiance">Confiance</Entete>
                      <Entete colonne="population" droite>
                        Habitants
                      </Entete>
                      <th scope="col" className="px-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtrees.map((z) => {
                      const eau = z.classe_eau ? TYPE_EAU[z.classe_eau] : null;
                      return (
                        <tr key={z.id} className="transition-colors hover:bg-surface-2">
                          <td className="px-3 py-3 align-top text-petit font-semibold tabular-nums text-ink-2">
                            {z.rang ?? "–"}
                          </td>
                          <td className="max-w-[320px] px-3 py-3 align-top">
                            <Link
                              href={`/zone/${encodeURIComponent(z.id)}`}
                              className="font-medium text-ink underline-offset-4 hover:text-primary-ink hover:underline"
                            >
                              {z.nom}
                            </Link>
                            <p className="text-petit text-ink-3">{z.commune}</p>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <BadgePriorite priorite={z.priorite} court />
                          </td>
                          <td className="px-3 py-3 text-right align-top">
                            <span className="tabular-nums text-ink">
                              {formatNombre(Math.round(z.habitants_jours_an))}
                            </span>
                            <span
                              className="mt-1.5 ml-auto block h-1 w-24 overflow-hidden rounded-pill bg-surface-3"
                              aria-hidden
                            >
                              <span
                                className="block h-full rounded-pill bg-primary"
                                style={{ width: `${Math.round((z.habitants_jours_an / max) * 100)}%` }}
                              />
                            </span>
                          </td>
                          <td className="hidden px-3 py-3 align-top text-petit text-ink-2 xl:table-cell">
                            {eau ? (
                              <span className="inline-flex items-center gap-1.5">
                                <eau.Icone size={14} strokeWidth={1.75} aria-hidden />
                                {eau.libelle}
                              </span>
                            ) : (
                              <span className="text-ink-3">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <IndicateurConfiance confiance={z.confiance} court />
                          </td>
                          <td className="px-3 py-3 text-right align-top text-petit tabular-nums text-ink-2">
                            {z.population != null ? (
                              formatHabitants(z.population)
                            ) : (
                              <span title="Non disponible">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right align-top">
                            <Link
                              href={`/?zone=${encodeURIComponent(z.id)}`}
                              aria-label={`Voir ${z.nom} sur la carte`}
                              title="Voir sur la carte"
                              className="inline-flex size-9 items-center justify-center rounded-sm text-ink-2 hover:bg-surface-3 hover:text-ink"
                            >
                              <MapPin {...ICONE_PETITE} aria-hidden />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Téléphone et tablette : une carte par zone, sans défilement horizontal */}
              <CartesZones zones={filtrees} />
            </>
          )}
        </>
      )}
    </div>
  );
}
