import { ShieldCheck, Target, TriangleAlert } from "lucide-react";
import { Bande } from "@/components/methode/bande";
import { ETAPES, LIMITES } from "@/components/methode/contenu";
import { ICONE, ICONE_GRANDE } from "@/lib/design";

/** Les cinq étapes du calcul, de la pluie au classement. */
export function SectionEtapes() {
  return (
    <Bande
      id="etapes"
      surtitre="Comment ça marche"
      titre="Les étapes du calcul"
      intro="De la pluie au classement des zones, cinq étapes, refaites à l'identique à partir des paramètres publiés plus bas."
      alterne
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ETAPES.map(({ titre, texte, Icone }, i) => (
          <li key={titre} className="flex flex-col rounded-lg border border-line bg-bg p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary-ink">
                <Icone {...ICONE_GRANDE} aria-hidden />
              </span>
              <span className="text-chiffre tabular-nums text-line-strong" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-5 text-titre3 text-ink">
              <span className="sr-only">Étape {i + 1} : </span>
              {titre}
            </h3>
            <p className="mt-2 text-petit text-ink-2">{texte}</p>
          </li>
        ))}
      </ol>
    </Bande>
  );
}

/** L'indicateur, avec un exemple de calcul. */
export function SectionIndicateur() {
  return (
    <Bande id="indicateur" surtitre="L'indicateur" titre="Habitants-jours sous l'eau">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-ink-2">
          <p>
            C&apos;est le nombre d&apos;habitants touchés multiplié par le nombre de jours où l&apos;eau est restée. Un
            seul indicateur, sans score composite, pour qu&apos;un maire puisse le refaire.
          </p>
          <p>
            Les zones où l&apos;eau a été vue sont ensuite réparties en trois tiers : priorité forte, moyenne et faible.
            Les zones sans étendue d&apos;eau visible par satellite restent à part.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-8 shadow-float">
          <p className="text-surtitre uppercase text-ink-3">Exemple de calcul</p>
          <p className="mt-4 text-titre3 tabular-nums text-ink">200 habitants × 10 jours</p>
          <p className="text-titre3 tabular-nums text-ink">+ 50 habitants × 2 jours</p>
          <p className="mt-4 border-t border-line pt-4 text-display tabular-nums text-vif">2 100</p>
          <p className="text-petit text-ink-2">habitants-jours</p>
        </div>
      </div>
    </Bande>
  );
}

/** Ce que les chiffres ne disent pas. */
export function SectionLimites() {
  return (
    <Bande
      id="limites"
      surtitre="Honnêteté sur la donnée"
      titre="Ce que les chiffres ne disent pas"
      intro="Une carte d'eau observée n'est pas une prévision, et l'exposition n'est pas tout le risque. Ces limites accompagnent chaque chiffre de l'application."
      alterne
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIMITES.map((l) => (
          <li key={l} className="flex gap-3 rounded-lg border border-line bg-bg p-5">
            <TriangleAlert {...ICONE} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
            <span className="text-petit text-ink-2">{l}</span>
          </li>
        ))}
      </ul>
    </Bande>
  );
}

/** Priorité et confiance : deux informations différentes. */
export function SectionFiabilite() {
  return (
    <Bande id="fiabilite" surtitre="Fiabilité" titre="Où agir, et à quel point c'est sûr">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-6">
          <Target {...ICONE_GRANDE} className="text-ink-3" aria-hidden />
          <h3 className="mt-4 text-titre3 text-ink">La priorité dit où agir d&apos;abord</h3>
          <p className="mt-2 text-petit text-ink-2">
            Forte, moyenne ou faible selon les habitants-jours sous l&apos;eau. Sur la carte, c&apos;est la couleur de
            la zone, toujours accompagnée de son libellé.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-6">
          <ShieldCheck {...ICONE_GRANDE} className="text-ink-3" aria-hidden />
          <h3 className="mt-4 text-titre3 text-ink">La confiance dit à quel point la mesure est sûre</h3>
          <p className="mt-2 text-petit text-ink-2">
            Élevée, moyenne ou faible selon la part de bâti, le nombre d&apos;images exploitables et l&apos;accord avec
            les inondations connues. Sur la carte, ce sont les hachures. Les règles exactes et le taux d&apos;accord de
            la validation seront publiés ici avec les résultats réels.
          </p>
        </div>
      </div>
    </Bande>
  );
}
