"use client";

import { ArrowUpRight, BookOpen, Building2, CalendarClock, Lightbulb, Map as IconeCarte, Waves } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlerteErreur, BandeauMaquette, EtatVide } from "@/components/ui/etats";
import { Squelette, SqueletteFiche } from "@/components/ui/squelette";
import { ActionsFiche } from "@/components/zone/actions-fiche";
import { BadgePriorite, IndicateurConfiance } from "@/components/zone/badges";
import { Bloc, EauObservee, Exposition } from "@/components/zone/chiffres-zone";
import { estMaquette, getEvenements, getZoneDetail, getZones } from "@/lib/data";
import { ICONE_PETITE } from "@/lib/design";
import { formatDate, formatHabitants, formatNombre, formatPourcent } from "@/lib/format";
import { EXPLICATION_PRIORITE } from "@/lib/priorite";
import { historique, ordinal, phraseSynthese, SUGGESTION_EAU } from "@/lib/synthese";
import { cn } from "@/lib/utils";
import type { Evenement, ZoneDetail, ZonesGeoJSON } from "@/types/contracts";

// Recharts n'est chargé que lorsqu'une fiche avec historique s'affiche.
const HistogrammeSaisons = dynamic(() => import("@/components/zone/histogramme-saisons"), {
  ssr: false,
  loading: () => <Squelette className="h-64 rounded-lg" />,
});

// Mini-carte de situation, seulement sur la page de la fiche (la carte est déjà là dans le panneau).
const CarteZones = dynamic(() => import("@/components/carte/carte-zones"), {
  ssr: false,
  loading: () => <Squelette className="absolute inset-0 rounded-none" />,
});

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string }
  | { statut: "inconnue" }
  | { statut: "ok"; detail: ZoneDetail; zones: ZonesGeoJSON; pluie: Evenement | null };

type Props = {
  id: string;
  /** Page /zone/[id] (et non panneau de la carte) */
  autonome?: boolean;
  /** Lance l'impression dès que la fiche est chargée (lien « Imprimer » depuis la carte) */
  imprimerAuChargement?: boolean;
};

/** E2 · Fiche zone : dans le panneau de la carte, ou en page partageable et imprimable. */
export function FicheZone({ id, autonome = false, imprimerAuChargement = false }: Props) {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });

  const charger = useCallback(() => {
    setEtat({ statut: "chargement" });
    // Les épisodes servent au lien « Voir après la pluie » : leur absence ne bloque pas la fiche.
    Promise.all([getZoneDetail(id), getZones(), getEvenements().catch(() => [])])
      .then(([detail, zones, evenements]) =>
        setEtat(detail ? { statut: "ok", detail, zones, pluie: evenements[0] ?? null } : { statut: "inconnue" }),
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

  if (etat.statut === "chargement") return <SqueletteFiche />;
  if (etat.statut === "erreur") {
    return <AlerteErreur titre="La fiche n'a pas pu être chargée" message={etat.message} onReessayer={charger} />;
  }
  if (etat.statut === "inconnue") {
    return (
      <EtatVide
        titre="Zone introuvable"
        action={
          <Link
            href="/zones"
            className="min-h-cible text-petit font-medium text-primary-ink underline-offset-4 hover:underline"
          >
            Voir le classement des zones
          </Link>
        }
      >
        Aucune zone ne porte l&apos;identifiant « {id} ». Le lien est peut-être ancien, ou la zone a été renommée lors
        d&apos;un nouveau calcul.
      </EtatVide>
    );
  }

  const { zone, indicateurs_saison } = etat.detail;
  const h = historique(indicateurs_saison);
  const maquette = estMaquette([zone.nom]);
  const Titre = autonome ? "h1" : "h2";
  const total = etat.zones.features.length;

  return (
    <article className={cn("space-y-7", autonome && "lg:space-y-8")}>
      {/* Dans le panneau de la carte, le bandeau de la carte suffit ; en page seule ou imprimée, il est ici. */}
      {maquette && autonome && <BandeauMaquette />}

      {/* 1-2 · Identification, priorité et confiance */}
      <header>
        <p className="text-surtitre uppercase text-ink-3">Fiche zone · {zone.commune}</p>
        <Titre className={cn("mt-1 text-ink", autonome ? "text-titre1 lg:text-[28px] lg:leading-9" : "text-titre1")}>
          {zone.nom}
        </Titre>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <BadgePriorite priorite={zone.priorite} />
          {zone.rang !== null && (
            <span className="inline-flex min-h-6 items-center rounded-pill bg-surface-3 px-2 text-petit tabular-nums text-ink">
              {ordinal(zone.rang)} sur {formatNombre(total)} zones
            </span>
          )}
          <IndicateurConfiance confiance={zone.confiance} explique />
        </div>
        <p className="mt-2 text-petit text-ink-2">{EXPLICATION_PRIORITE[zone.priorite]}</p>
      </header>

      <p className="rounded-lg border-l-[3px] border-primary bg-primary-soft px-4 py-3 text-ink">
        {phraseSynthese(zone, h)}
      </p>

      {/* 3 · Situation géographique */}
      <Bloc titre="Situation" icone={IconeCarte}>
        {autonome && (
          <div className="relative mb-3 h-56 overflow-hidden rounded-lg border border-line print:hidden">
            <CarteZones
              zones={etat.zones}
              selection={zone.id}
              miniature
              libelle={`Situation de ${zone.nom} sur la carte`}
            />
            <Link
              href={`/?zone=${encodeURIComponent(zone.id)}`}
              className="verre absolute left-3 top-3 z-controle inline-flex min-h-9 items-center gap-1.5 rounded-pill px-3 text-petit font-medium text-ink [@media(pointer:coarse)]:min-h-cible"
            >
              Ouvrir sur la carte
              <ArrowUpRight {...ICONE_PETITE} aria-hidden />
            </Link>
          </div>
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-petit sm:grid-cols-3">
          <div>
            <dt className="text-ink-3">Commune</dt>
            <dd className="font-medium text-ink">{zone.commune}</dd>
          </div>
          <div>
            <dt className="text-ink-3">Habitants</dt>
            <dd className="font-medium tabular-nums text-ink">
              {zone.population != null ? `environ ${formatHabitants(zone.population)}` : "non disponible"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-3">Part de bâti</dt>
            <dd className="font-medium tabular-nums text-ink">
              {zone.part_bati != null ? formatPourcent(zone.part_bati) : "non disponible"}
            </dd>
          </div>
        </dl>
      </Bloc>

      {/* 4 · Eau observée */}
      <Bloc titre="Ce que le satellite a vu" icone={Waves}>
        <EauObservee zone={zone} h={h} />
      </Bloc>

      {/* 5 · Exposition */}
      <Bloc titre="Ce qui est touché" icone={Building2}>
        <Exposition zone={zone} />
      </Bloc>

      {/* 6 · Historique */}
      {indicateurs_saison.length > 0 ? (
        <HistogrammeSaisons saisons={indicateurs_saison} />
      ) : (
        <Bloc titre="Hivernages 2020-2026" icone={CalendarClock}>
          <EtatVide icone={CalendarClock}>
            L&apos;historique par hivernage n&apos;est pas encore publié pour cette zone. Les chiffres ci-dessus sont la
            synthèse 2020-2026.
          </EtatVide>
        </Bloc>
      )}

      {/* 7 · Ce que ça suggère */}
      {zone.classe_eau && (
        <Bloc titre="Ce que ça suggère" icone={Lightbulb}>
          <div className="rounded-lg border border-line bg-surface-2 p-4">
            <p className="text-ink">{SUGGESTION_EAU[zone.classe_eau]}</p>
            <p className="mt-2 text-petit text-ink-2">
              Une aide à la décision tirée des images satellite, à confirmer sur le terrain : ce n&apos;est pas une
              consigne.
            </p>
          </div>
        </Bloc>
      )}

      {/* 8 · Fiabilité et méthode */}
      <Bloc titre="Fiabilité" icone={BookOpen}>
        <ul className="space-y-1.5 text-petit text-ink-2">
          <li>
            {h
              ? `${formatNombre(h.imagesValides)} images radar exploitables sur 2020-2026, dont ${formatNombre(h.imagesInondees)} avec de l'eau.`
              : "Historique par hivernage non disponible."}
          </li>
          <li>Calcul du {formatDate(zone.maj)}.</li>
          {zone.confiance === "faible" && (
            <li className="text-ink">Mesure moins fiable : à vérifier sur le terrain.</li>
          )}
          {maquette && <li>Données fictives [FICTIF] : maquette de l&apos;outil.</li>}
        </ul>
        <Link
          href="/methode"
          className="mt-2 inline-flex min-h-cible items-center gap-1 text-petit font-medium text-primary-ink underline-offset-4 hover:underline"
        >
          Comment ces chiffres sont calculés
          <ArrowUpRight {...ICONE_PETITE} aria-hidden />
        </Link>
      </Bloc>

      <ActionsFiche id={zone.id} nom={zone.nom} autonome={autonome} pluie={etat.pluie} />
    </article>
  );
}
