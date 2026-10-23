"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Bouton } from "@/components/ui/bouton";
import { ChiffreCle } from "@/components/ui/chiffre-cle";
import { Compteur } from "@/components/ui/compteur";
import { ControleSegmente } from "@/components/ui/controle-segmente";
import { Encart } from "@/components/ui/encart";
import { AlerteErreur, Bandeau, BandeauMaquette, EtatVide, EtatBalise } from "@/components/ui/etats";
import { Infobulle } from "@/components/ui/infobulle";
import { Pastille } from "@/components/ui/pastille";
import { ChoixTheme } from "@/components/shell/choix-theme";
import { Interrupteur } from "@/components/ui/interrupteur";
import { Repartition } from "@/components/ui/repartition";
import { Squelette, SqueletteListe } from "@/components/ui/squelette";
import { Statistique } from "@/components/ui/statistique";
import { BadgePriorite, IndicateurConfiance } from "@/components/zone/badges";
import { ICONE } from "@/lib/design";

const COULEURS = [
  ["--ink", "Encre"],
  ["--ink-2", "Encre secondaire"],
  ["--ink-3", "Métadonnées"],
  ["--bg", "Fond"],
  ["--surface", "Surface"],
  ["--surface-2", "Surface 2"],
  ["--surface-3", "Surface 3"],
  ["--line", "Bordure"],
  ["--line-strong", "Bord des champs"],
  ["--primary", "Primaire"],
  ["--primary-strong", "Primaire survol"],
  ["--primary-ink", "Lien"],
  ["--primary-soft", "Primaire léger"],
  ["--nuit", "Navigation (bleu nuit)"],
  ["--accent", "Repère de page active"],
  ["--danger", "Erreur, seuil dépassé"],
  ["--water", "Eau détectée"],
  ["--water-line", "Contour de l'eau"],
  ["--prio-high", "Priorité forte"],
  ["--prio-mid", "Priorité moyenne"],
  ["--prio-low", "Priorité faible"],
  ["--prio-none", "Sans étendue d'eau visible"],
  ["--ok", "Balise en ligne"],
  ["--off", "Balise hors ligne"],
] as const;

const TYPO = [
  ["text-display", "Indicateur principal · 40/44"],
  ["text-chiffre", "Chiffre clé · 32/40"],
  ["text-titre1", "Titre 1 · 24/32"],
  ["text-titre2", "Titre 2 · 20/28"],
  ["text-titre3", "Titre 3 · 16/24"],
  ["text-texte", "Texte · 16/24"],
  ["text-petit", "Petit · 14/20"],
  ["text-mention", "Mention · 12/16"],
  ["text-surtitre uppercase", "Surtitre · 12/16"],
] as const;

const MODES = [
  { valeur: "avant", libelle: "Avant la saison" },
  { valeur: "apres", libelle: "Après une pluie" },
  { valeur: "balise", libelle: "Balise" },
];

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-titre2">{titre}</h2>
      {children}
    </section>
  );
}

/** Catalogue vivant des jetons et composants (documentation : web/DESIGN-SYSTEM.md). */
export function Catalogue() {
  const [mode, setMode] = useState("avant");
  const [commune, setCommune] = useState("Keur Massar Nord");
  const [couche, setCouche] = useState(true);

  return (
    <main className="mx-auto max-w-lecture space-y-10 px-4 py-8">
      <header>
        <p className="text-titre1">
          Mbënn<span className="text-primary">Scan</span>
        </p>
        <h1 className="text-ink-2">Design system : jetons et composants</h1>
      </header>

      <Section titre="Thème">
        <p className="text-petit text-ink-2">
          Clair par défaut ; toutes les couleurs ci-dessous suivent le thème choisi.
        </p>
        <ChoixTheme avecLibelles />
      </Section>

      <Section titre="Couleurs">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COULEURS.map(([v, nom]) => (
            <li key={v} className="flex items-center gap-3">
              <span className="size-10 shrink-0 rounded-sm border border-line" style={{ background: `var(${v})` }} />
              <span className="text-petit">
                {nom}
                <code className="block text-mention text-ink-2">{v}</code>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section titre="Typographie">
        {TYPO.map(([classe, nom]) => (
          <p key={classe} className={classe}>
            {nom}
          </p>
        ))}
        <p className="text-chiffre tabular-nums">12 480</p>
      </Section>

      <Section titre="Formes">
        <div className="flex flex-wrap gap-4">
          <span className="size-16 rounded-sm border border-line bg-surface" title="8 px" />
          <span className="size-16 rounded-md border border-line bg-surface" title="12 px" />
          <span className="size-16 rounded-pill border border-line bg-surface" title="999 px" />
          <span className="size-16 rounded-lg bg-surface shadow-1" title="Élévation 1" />
          <span className="size-16 rounded-md bg-surface shadow-float" title="Ombre flottante" />
          <span className="size-16 rounded-lg bg-surface shadow-pop" title="Menus et dialogues" />
          <span className="hachures-moyenne size-16 rounded-sm border border-ink-2" title="Confiance moyenne" />
          <span
            className="hachures-faible size-16 rounded-sm border border-dashed border-ink"
            title="Confiance faible"
          />
        </div>
      </Section>

      <Section titre="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Bouton>Partager</Bouton>
          <Bouton variante="secondaire">Imprimer la fiche</Bouton>
          <Bouton variante="discret">Voir après la pluie</Bouton>
          <Bouton variante="icone" aria-label="Rechercher">
            <Search {...ICONE} aria-hidden />
          </Bouton>
          <Bouton variante="danger">Supprimer le filtre</Bouton>
          <Bouton taille="compacte" variante="secondaire">
            Compact
          </Bouton>
          <Bouton disabled>Indisponible</Bouton>
        </div>
      </Section>

      <Section titre="Sélection">
        <ControleSegmente libelle="Mode" segments={MODES} valeur={mode} onChange={setMode} />
        <div className="flex flex-wrap gap-2">
          {["Keur Massar Nord", "Keur Massar Sud", "Malika"].map((c) => (
            <Pastille key={c} active={c === commune} onClick={() => setCommune(c)}>
              {c}
            </Pastille>
          ))}
        </div>
      </Section>

      <Section titre="Interrupteur">
        <div className="max-w-xs">
          <Interrupteur
            actif={couche}
            onChange={setCouche}
            libelle="Confiance de la mesure"
            detail="Hachures sur la carte"
          />
        </div>
      </Section>

      <Section titre="Badges">
        <div className="flex flex-wrap gap-3">
          <BadgePriorite priorite="forte" />
          <BadgePriorite priorite="moyenne" />
          <BadgePriorite priorite="faible" />
          <BadgePriorite priorite="nulle" />
        </div>
        <div className="flex flex-wrap gap-4">
          <IndicateurConfiance confiance="elevee" />
          <IndicateurConfiance confiance="moyenne" />
          <IndicateurConfiance confiance="faible" />
        </div>
        <div className="flex flex-wrap gap-4">
          <EtatBalise enLigne>Mis à jour il y a 4 s</EtatBalise>
          <EtatBalise enLigne={false}>Dernière mesure il y a 5 min</EtatBalise>
        </div>
      </Section>

      <Section titre="Donnée">
        <div className="grid grid-cols-2 gap-3">
          <ChiffreCle
            valeur={<Compteur valeur={14} format={(n) => `${Math.round(n)} j`} />}
            intitule="Durée moyenne"
            phrase="Combien de temps l'eau reste après une forte pluie."
            info="Moyenne sur les hivernages 2020-2026, calculée sur les images radar exploitables."
          />
          <ChiffreCle mot valeur="Stagnation" intitule="Type d'eau" phrase="L'eau reste plus de 12 jours." />
        </div>
        <p className="flex items-center gap-2">
          Habitants-jours par an
          <Infobulle libelle="À propos des habitants-jours">Habitants touchés × jours d&apos;eau.</Infobulle>
        </p>
        <div className="grid grid-cols-2 gap-6 rounded-lg border border-line p-4">
          <Statistique
            principal
            intitule="Habitants-jours sous l'eau par an"
            valeur="12 480"
            detail="Exemple, valeur inventée"
          />
          <Statistique intitule="Dernière image après pluie" valeur={null} detail="Aucun épisode exploitable" />
        </div>
        <Repartition
          titre="Fiabilité des mesures"
          unite="zones"
          lignes={[
            { cle: "a", libelle: <IndicateurConfiance confiance="elevee" court />, valeur: 4 },
            { cle: "b", libelle: <IndicateurConfiance confiance="moyenne" court />, valeur: 2 },
            { cle: "c", libelle: <IndicateurConfiance confiance="faible" court />, valeur: 1 },
          ]}
        />
        <Encart>Encart avec bordure, sur fond de page.</Encart>
        <Encart flottant>Encart flottant, au-dessus de la carte.</Encart>
      </Section>

      <Section titre="États">
        <div className="space-y-2" aria-busy="true">
          <Squelette className="h-8 w-2/3" />
          <Squelette className="h-20" />
        </div>
        <SqueletteListe lignes={2} />
        <EtatVide>Aucune eau visible par le radar dans cette zone sur cette image.</EtatVide>
        <AlerteErreur message="Impossible de charger les zones." onReessayer={() => undefined} />
        <Bandeau>Image radar Sentinel-1 du 6 octobre 2026, deux jours après la pluie.</Bandeau>
        <BandeauMaquette />
        <Bandeau horsLigne>Vous êtes hors ligne : données enregistrées sur cet appareil le 17 octobre.</Bandeau>
      </Section>
    </main>
  );
}
