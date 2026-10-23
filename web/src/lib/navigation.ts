import { BookOpen, CloudRain, LayoutDashboard, ListOrdered, Radio, type LucideIcon } from "lucide-react";

// Architecture de l'application : une seule source pour la barre latérale, le menu mobile,
// la palette de recherche et l'en-tête de contexte.

export const BALISE_PAR_DEFAUT = process.env.NEXT_PUBLIC_DEFAULT_BALISE_ID || "bal-01";

export type Mode = "avant" | "apres" | "balise";

export type Lien = {
  href: string;
  libelle: string;
  description: string;
  Icone: LucideIcon;
  actif: (chemin: string) => boolean;
};

export const GROUPES: { titre: string; liens: Lien[] }[] = [
  {
    titre: "Avant la saison",
    liens: [
      {
        href: "/",
        libelle: "Vue générale",
        description: "Carte des zones et indicateurs clés, hivernages 2020-2026",
        Icone: LayoutDashboard,
        actif: (c) => c === "/",
      },
      {
        href: "/zones",
        libelle: "Zones prioritaires",
        description: "Classement complet, recherche et tri",
        Icone: ListOrdered,
        actif: (c) => c.startsWith("/zones") || c.startsWith("/zone/"),
      },
    ],
  },
  {
    titre: "Opérations",
    liens: [
      {
        href: "/apres",
        libelle: "Après une pluie",
        description: "Eau détectée après un épisode et zones à visiter",
        Icone: CloudRain,
        actif: (c) => c.startsWith("/apres"),
      },
      {
        href: `/balise/${BALISE_PAR_DEFAUT}`,
        libelle: "Balise",
        description: "Niveau d'un bassin mesuré au sol",
        Icone: Radio,
        actif: (c) => c.startsWith("/balise"),
      },
    ],
  },
  {
    titre: "Référence",
    liens: [
      {
        href: "/methode",
        libelle: "Méthode et limites",
        description: "Calculs, limites, sources et paramètres",
        Icone: BookOpen,
        actif: (c) => c.startsWith("/methode"),
      },
    ],
  },
];

export const LIENS = GROUPES.flatMap((g) => g.liens);

/** Mode d'utilisation de la page (sélecteur de mode sur mobile). */
export function modeDe(chemin: string): Mode | null {
  if (chemin === "/" || chemin.startsWith("/zone")) return "avant";
  if (chemin.startsWith("/apres")) return "apres";
  if (chemin.startsWith("/balise")) return "balise";
  return null;
}

export const CHEMIN_MODE: Record<Mode, string> = {
  avant: "/",
  apres: "/apres",
  balise: `/balise/${BALISE_PAR_DEFAUT}`,
};

export type Contexte = { mode: string; page: string; secteur: string | null; periode: string | null };

/** Contexte de travail affiché dans l'en-tête : mode, page, secteur et période. */
export function contexteDe(chemin: string): Contexte {
  const page = LIENS.find((l) => l.actif(chemin))?.libelle ?? "Page introuvable";
  if (chemin.startsWith("/zone/")) {
    return { mode: "Avant la saison", page: "Fiche zone", secteur: "Keur Massar", periode: "Hivernages 2020-2026" };
  }
  switch (modeDe(chemin)) {
    case "avant":
      return { mode: "Avant la saison", page, secteur: "Keur Massar", periode: "Hivernages 2020-2026" };
    case "apres":
      return { mode: "Opérations", page, secteur: "Keur Massar", periode: "Épisodes de forte pluie" };
    case "balise":
      return { mode: "Opérations", page, secteur: "Mesure au sol", periode: "Temps réel" };
    default:
      return { mode: "Référence", page, secteur: null, periode: null };
  }
}

/** Événement qui ouvre la palette de recherche, depuis n'importe quel bouton. */
export const OUVRIR_RECHERCHE = "mbennscan:recherche";
export function ouvrirRecherche() {
  window.dispatchEvent(new Event(OUVRIR_RECHERCHE));
}
