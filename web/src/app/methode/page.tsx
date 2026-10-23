import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { ETAPES, LIMITES, SOMMAIRE, SOURCES } from "@/components/methode/contenu";
import { ParametresCalcul } from "@/components/methode/parametres-calcul";

export const metadata: Metadata = { title: "Méthode et limites · MbënnScan" };

// E6 · Méthode et limites. Le texte est dans components/methode/contenu.ts.

function Titre({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6 text-titre2 text-ink">
      {children}
    </h2>
  );
}

export default function PageMethode() {
  return (
    <main className="flex-1 bg-surface">
      <div className="halo-entete border-b border-line px-4 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-surtitre uppercase text-ink-3">Référence</p>
          <h1 className="mt-1 text-titre1 text-ink lg:text-[32px] lg:leading-10">Méthode et limites</h1>
          <p className="mt-2 max-w-lecture text-ink-2">
            MbënnScan mesure, à partir d&apos;images radar, où l&apos;eau des inondations est réellement restée dans la
            banlieue de Dakar depuis 2020, combien de temps, et chez combien d&apos;habitants. C&apos;est la seule page
            où les termes techniques sont employés, chacun expliqué.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-8">
        <nav aria-label="Sommaire" className="hidden lg:block">
          <div className="sticky top-6">
            <p className="text-surtitre uppercase text-ink-3">Sommaire</p>
            <ol className="mt-3 space-y-1 border-l border-line">
              {SOMMAIRE.map(([id, titre]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-petit text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {titre}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="max-w-lecture space-y-12">
          <section aria-labelledby="etapes">
            <Titre id="etapes">Les étapes du calcul</Titre>
            <ol className="mt-5">
              {ETAPES.map(({ titre, texte, Icone }, i) => (
                <li key={titre} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < ETAPES.length - 1 && (
                    <span className="absolute bottom-0 left-5 top-11 w-px bg-line" aria-hidden />
                  )}
                  <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-pill border border-line bg-primary-soft text-primary-ink">
                    <Icone size={20} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-titre3 text-ink">
                      <span className="mr-1.5 tabular-nums text-ink-3">{i + 1}.</span>
                      {titre}
                    </h3>
                    <p className="mt-1 text-ink-2">{texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="indicateur">
            <Titre id="indicateur">L&apos;indicateur : habitants-jours sous l&apos;eau</Titre>
            <p className="mt-3 text-ink-2">
              C&apos;est le nombre d&apos;habitants touchés multiplié par le nombre de jours où l&apos;eau est restée.
              Un seul indicateur, sans score composite, pour qu&apos;un maire puisse le refaire.
            </p>
            <div className="mt-4 rounded-lg border border-line bg-surface-2 p-5">
              <p className="text-surtitre uppercase text-ink-3">Exemple de calcul</p>
              <p className="mt-2 text-titre3 tabular-nums text-ink">
                200 habitants × 10 jours + 50 habitants × 2 jours
              </p>
              <p className="mt-1 text-chiffre tabular-nums text-ink">= 2 100 habitants-jours</p>
            </div>
          </section>

          <section aria-labelledby="limites">
            <Titre id="limites">Ce que les chiffres ne disent pas</Titre>
            <ul className="mt-4 space-y-3">
              {LIMITES.map((l) => (
                <li key={l} className="flex gap-3">
                  <TriangleAlert size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
                  <span className="text-ink-2">{l}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="fiabilite">
            <Titre id="fiabilite">Fiabilité</Titre>
            <p className="mt-3 text-ink-2">
              Chaque zone reçoit une confiance élevée, moyenne ou faible selon la part de bâti, le nombre d&apos;images
              exploitables et l&apos;accord avec les inondations connues. Les règles exactes et le taux d&apos;accord de
              la validation seront publiés ici avec les résultats réels.
            </p>
            <p className="mt-3 text-ink-2">
              La confiance et la priorité sont deux informations différentes : la priorité dit où agir d&apos;abord, la
              confiance dit à quel point la mesure est sûre. Sur la carte, la priorité est une couleur, la confiance des
              hachures.
            </p>
          </section>

          <section aria-labelledby="parametres">
            <Titre id="parametres">Refaire le calcul</Titre>
            <p className="mb-4 mt-3 text-ink-2">
              Paramètres du dernier calcul, tels qu&apos;enregistrés par le pipeline :
            </p>
            <ParametresCalcul />
          </section>

          <section aria-labelledby="sources">
            <Titre id="sources">Sources et licences</Titre>
            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-petit">
                <thead className="bg-surface-2 text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Donnée
                    </th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                      Licence
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Mention
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {SOURCES.map(([donnee, licence, mention]) => (
                    <tr key={donnee}>
                      <td className="px-4 py-3 align-top font-medium text-ink">
                        {donnee}
                        <span className="block font-normal text-ink-3 sm:hidden">{licence}</span>
                      </td>
                      <td className="hidden px-4 py-3 align-top text-ink-2 sm:table-cell">{licence}</td>
                      <td className="px-4 py-3 align-top text-ink-2">{mention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="equipe">
            <Titre id="equipe">L&apos;équipe</Titre>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Khalifa Babacar DIOUF", "Traitement satellite et indicateurs"],
                ["Serigne Abdoul Aziz NDIAYE", "Application et design"],
                ["Seydina Aboubacry KANE", "Balise et mesures"],
              ].map(([nom, role]) => (
                <li key={nom} className="rounded-lg border border-line p-4">
                  <p className="font-medium text-ink">{nom}</p>
                  <p className="text-petit text-ink-2">{role}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-petit text-ink-3">
              Équipe fflush · hackathon SENSAT-TRL « Du satellite à la solution », octobre 2026.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
