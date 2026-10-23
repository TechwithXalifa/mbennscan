import { CloudRain, Hourglass, Radar, Repeat, Users, type LucideIcon } from "lucide-react";

// Texte de la page Méthode et limites (E6), repris du cahier des charges (section 4) ;
// le texte définitif (issue #20), les règles de confiance et le taux d'accord le remplaceront.

export const ETAPES: { titre: string; texte: string; Icone: LucideIcon }[] = [
  {
    titre: "Repérer les fortes pluies",
    Icone: CloudRain,
    texte:
      "Pour chaque hivernage de 2020 à 2026, on retient les jours où il est tombé au moins 30 mm en 24 heures (CHIRPS, GPM IMERG), plus la pluie du 4 octobre 2026.",
  },
  {
    titre: "Voir l'eau au radar",
    Icone: Radar,
    texte:
      "Le radar Sentinel-1 voit à travers les nuages. Un pixel de 10 m est compté en eau si son signal (VV) passe sous un seuil et baisse d'au moins 3 dB par rapport à une image de la saison sèche (février à mai) prise sous le même angle. Les lacs, la mer et les pentes sont exclus.",
  },
  {
    titre: "Corriger le rythme des passages",
    Icone: Repeat,
    texte:
      "Le satellite passait tous les 6 ou tous les 12 jours selon les années. La fréquence est donc calculée comme images où la zone est en eau ÷ images exploitables, et non en nombre d'images.",
  },
  {
    titre: "Mesurer combien de temps l'eau reste",
    Icone: Hourglass,
    texte:
      "Après chaque pluie, on suit les images suivantes. Moins de 6 jours : ruissellement. 6 à 12 jours : intermédiaire. 12 jours ou plus : stagnation durable, souvent liée à la nappe.",
  },
  {
    titre: "Compter les habitants et classer les zones",
    Icone: Users,
    texte:
      "La population WorldPop est répartie sur les pixels. Habitants × jours d'eau donne les habitants-jours, moyennés par an. Les zones avec de l'eau sont réparties en trois tiers : priorité forte, moyenne, faible. Les bâtiments (Open Buildings), écoles et routes (OpenStreetMap) touchés sont comptés.",
  },
];

export const LIMITES = [
  "Une carte d'eau observée n'est pas une prévision de crue : elle dit où l'eau est venue, pas où elle viendra.",
  "L'exposition (habitants, bâtiments, écoles) ne suffit pas à évaluer tout le risque : la vulnérabilité des ménages n'est pas mesurée.",
  "En bâti très dense, le radar voit mal l'eau entre les murs : ces zones ont une confiance plus faible et sont hachurées sur la carte.",
  "La durée de l'eau dépend du rythme des passages du satellite : elle est précise à 3 à 6 jours près.",
  "« Stagnation durable » signale une remontée de nappe probable, à confirmer avec la DGPRE.",
  "La population vient de WorldPop, dont la dernière année disponible peut être antérieure à 2026.",
  "Les résultats sont agrégés par zone d'environ 0,1 km², jamais par ménage.",
];

export const SOURCES: [string, string, string][] = [
  [
    "Sentinel-1 et Sentinel-2, Copernicus DEM",
    "Données Copernicus, libres",
    "Contient des données Copernicus Sentinel modifiées (2020-2026)",
  ],
  ["OpenStreetMap", "ODbL", "© les contributeurs d'OpenStreetMap"],
  ["WorldPop", "CC BY 4.0", "Population : WorldPop"],
  ["Google Open Buildings", "CC BY 4.0 et ODbL", "Bâtiments : Google Open Buildings"],
  ["CHIRPS, GPM IMERG", "Libres, citation demandée", "Pluie journalière"],
  ["JRC Global Surface Water", "Libre, citation demandée", "Eau permanente"],
];

export const SOMMAIRE = [
  ["etapes", "Les étapes du calcul"],
  ["indicateur", "L'indicateur"],
  ["limites", "Ce que les chiffres ne disent pas"],
  ["fiabilite", "Fiabilité"],
  ["parametres", "Refaire le calcul"],
  ["sources", "Sources et licences"],
  ["equipe", "L'équipe"],
] as const;
