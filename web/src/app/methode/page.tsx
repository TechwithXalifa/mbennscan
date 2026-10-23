import type { Metadata } from "next";
import { Accroche, NavSections } from "@/components/methode/accroche";
import { Bande } from "@/components/methode/bande";
import { SOURCES } from "@/components/methode/contenu";
import { ParametresCalcul } from "@/components/methode/parametres-calcul";
import { SectionEtapes, SectionFiabilite, SectionIndicateur, SectionLimites } from "@/components/methode/sections";

export const metadata: Metadata = { title: "Méthode et limites · MbënnScan" };

// E6 · Méthode et limites, organisée comme une page de présentation : une accroche, puis une section
// pleine largeur par sujet, fonds alternés. Le texte est dans components/methode/contenu.ts.
export default function PageMethode() {
  return (
    <main className="flex-1">
      <Accroche />
      <NavSections />
      <SectionEtapes />
      <SectionIndicateur />
      <SectionLimites />
      <SectionFiabilite />

      <Bande
        id="parametres"
        surtitre="Reproductibilité"
        titre="Refaire le calcul"
        intro="Paramètres du dernier calcul, tels qu'enregistrés par le traitement satellite."
        alterne
      >
        <div className="max-w-3xl">
          <ParametresCalcul />
        </div>
      </Bande>

      <Bande id="sources" surtitre="Données ouvertes" titre="Sources et licences">
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-petit">
            <thead className="bg-surface-2 text-ink-2">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Donnée
                </th>
                <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">
                  Licence
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Mention
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SOURCES.map(([donnee, licence, mention]) => (
                <tr key={donnee}>
                  <td className="px-5 py-4 align-top font-medium text-ink">
                    {donnee}
                    <span className="block font-normal text-ink-3 sm:hidden">{licence}</span>
                  </td>
                  <td className="hidden px-5 py-4 align-top text-ink-2 sm:table-cell">{licence}</td>
                  <td className="px-5 py-4 align-top text-ink-2">{mention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bande>

      <Bande id="equipe" surtitre="Équipe fflush" titre="L'équipe" alterne>
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            ["Khalifa Babacar DIOUF", "Traitement satellite et indicateurs"],
            ["Serigne Abdoul Aziz NDIAYE", "Application et design"],
            ["Seydina Aboubacry KANE", "Balise et mesures"],
          ].map(([nom, role]) => (
            <li key={nom} className="rounded-lg border border-line bg-bg p-6">
              <p className="font-semibold text-ink">{nom}</p>
              <p className="mt-1 text-petit text-ink-2">{role}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-petit text-ink-3">Hackathon SENSAT-TRL « Du satellite à la solution », octobre 2026.</p>
      </Bande>
    </main>
  );
}
