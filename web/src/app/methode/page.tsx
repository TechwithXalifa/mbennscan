import type { Metadata } from "next";
import Link from "next/link";
import { ParametresCalcul } from "@/components/methode/parametres-calcul";

export const metadata: Metadata = { title: "Méthode et limites · MbënnScan" };

// E6 · Méthode et limites. Contenu repris du cahier des charges (section 4) ;
// le texte définitif (issue #20), les règles de confiance et le taux d'accord le remplaceront.

const ETAPES = [
  {
    titre: "1. Repérer les fortes pluies",
    texte:
      "Pour chaque hivernage de 2020 à 2026, on retient les jours où il est tombé au moins 30 mm en 24 heures (CHIRPS, GPM IMERG), plus la pluie du 4 octobre 2026.",
  },
  {
    titre: "2. Voir l'eau au radar",
    texte:
      "Le radar Sentinel-1 voit à travers les nuages. Un pixel de 10 m est compté en eau si son signal (VV) passe sous un seuil et baisse d'au moins 3 dB par rapport à une image de la saison sèche (février à mai) prise sous le même angle. Les lacs, la mer et les pentes sont exclus.",
  },
  {
    titre: "3. Corriger le rythme des passages",
    texte:
      "Le satellite passait tous les 6 ou tous les 12 jours selon les années. La fréquence est donc calculée comme images où la zone est en eau ÷ images exploitables, et non en nombre d'images.",
  },
  {
    titre: "4. Mesurer combien de temps l'eau reste",
    texte:
      "Après chaque pluie, on suit les images suivantes. Moins de 6 jours : ruissellement. 6 à 12 jours : intermédiaire. 12 jours ou plus : stagnation durable, souvent liée à la nappe.",
  },
  {
    titre: "5. Compter les habitants et classer les zones",
    texte:
      "La population WorldPop est répartie sur les pixels. Habitants × jours d'eau donne les habitants-jours, moyennés par an. Les zones avec de l'eau sont réparties en trois tiers : priorité forte, moyenne, faible. Les bâtiments (Open Buildings), écoles et routes (OpenStreetMap) touchés sont comptés.",
  },
];

const LIMITES = [
  "Une carte d'eau observée n'est pas une prévision de crue : elle dit où l'eau est venue, pas où elle viendra.",
  "L'exposition (habitants, bâtiments, écoles) ne suffit pas à évaluer tout le risque : la vulnérabilité des ménages n'est pas mesurée.",
  "En bâti très dense, le radar voit mal l'eau entre les murs : ces zones ont une confiance plus faible et sont hachurées sur la carte.",
  "La durée de l'eau dépend du rythme des passages du satellite : elle est précise à 3 à 6 jours près.",
  "« Stagnation durable » signale une remontée de nappe probable, à confirmer avec la DGPRE.",
  "La population vient de WorldPop, dont la dernière année disponible peut être antérieure à 2026.",
  "Les résultats sont agrégés par zone d'environ 0,1 km², jamais par ménage.",
];

const SOURCES: [string, string, string][] = [
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

export default function PageMethode() {
  return (
    <main className="mx-auto max-w-[680px] bg-surface px-4 py-6">
      <Link href="/" className="inline-flex min-h-cible items-center text-petit text-primary">
        ← Carte
      </Link>
      <h1 className="text-titre1">Méthode et limites</h1>
      <p className="mt-2">
        MbënnScan mesure, à partir d&apos;images radar, où l&apos;eau des inondations est réellement restée dans la
        banlieue de Dakar depuis 2020, combien de temps, et chez combien d&apos;habitants.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-titre2">Les étapes du calcul</h2>
        {ETAPES.map((e) => (
          <div key={e.titre} className="rounded-md border border-line p-4">
            <h3 className="text-titre3">{e.titre}</h3>
            <p className="mt-1">{e.texte}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-titre2">L&apos;indicateur : habitants-jours sous l&apos;eau</h2>
        <p className="mt-2">
          C&apos;est le nombre d&apos;habitants touchés multiplié par le nombre de jours où l&apos;eau est restée.
          Exemple de calcul : 200 habitants pendant 10 jours et 50 habitants pendant 2 jours font 200 × 10 + 50 × 2 = 2
          100 habitants-jours. Un seul indicateur, sans score composite, pour qu&apos;un maire puisse le refaire.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-titre2">Ce que les chiffres ne disent pas</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {LIMITES.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-titre2">Fiabilité</h2>
        <p className="mt-2">
          Chaque zone reçoit une confiance élevée, moyenne ou faible selon la part de bâti, le nombre d&apos;images
          exploitables et l&apos;accord avec les inondations connues. Les règles exactes et le taux d&apos;accord de la
          validation seront publiés ici avec les résultats réels.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-titre2">Refaire le calcul</h2>
        <p className="mt-2 mb-3">Paramètres du dernier calcul, tels qu&apos;enregistrés par le pipeline :</p>
        <ParametresCalcul />
      </section>

      <section className="mt-8">
        <h2 className="text-titre2">Sources et licences</h2>
        <ul className="mt-2 divide-y divide-line">
          {SOURCES.map(([donnee, licence, mention]) => (
            <li key={donnee} className="py-2">
              <p className="font-medium">{donnee}</p>
              <p className="text-petit text-ink-2">
                {licence} · {mention}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-titre2">L&apos;équipe</h2>
        <ul className="mt-2 space-y-1">
          <li>Khalifa Babacar DIOUF : traitement satellite et indicateurs</li>
          <li>Serigne Abdoul Aziz NDIAYE : application et design</li>
          <li>Seydina Aboubacry KANE : balise et mesures</li>
        </ul>
        <p className="mt-2 text-petit text-ink-2">
          Équipe fflush · hackathon SENSAT-TRL « Du satellite à la solution », octobre 2026.
        </p>
      </section>
    </main>
  );
}
