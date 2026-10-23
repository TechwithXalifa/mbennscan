"use client";

import { CornerDownLeft, MapPin, Search, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Dialogue } from "@/components/ui/dialogue";
import { SymbolePriorite } from "@/components/zone/badges";
import { getZones } from "@/lib/data";
import { ICONE, ICONE_PETITE } from "@/lib/design";
import { LIENS, OUVRIR_RECHERCHE } from "@/lib/navigation";
import { LIBELLE_PRIORITE } from "@/lib/priorite";
import { cn } from "@/lib/utils";
import type { ZoneSynthese } from "@/types/contracts";

/** Sans accents ni majuscules, sans la marque [FICTIF] : « medina » trouve « Médina Gounass ». */
function normaliser(texte: string): string {
  return texte
    .replace(/^\[FICTIF\]\s*/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

type Resultat =
  | { type: "page"; cle: string; libelle: string; detail: string; href: string; Icone: (typeof LIENS)[number]["Icone"] }
  | { type: "zone"; cle: string; zone: ZoneSynthese };

/**
 * Recherche d'une zone par son nom ou sa commune (fonction F8 du cahier des charges) et accès rapide aux pages.
 * Ctrl K (ou ⌘ K) l'ouvre depuis n'importe quel écran ; une zone choisie s'ouvre sur la carte.
 */
export function PaletteRecherche() {
  const router = useRouter();
  const [ouverte, setOuverte] = useState(false);
  const [requete, setRequete] = useState("");
  const [zones, setZones] = useState<ZoneSynthese[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [actif, setActif] = useState(0);
  const champ = useRef<HTMLInputElement>(null);
  const liste = useId();

  useEffect(() => {
    const ouvrir = () => setOuverte(true);
    const clavier = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOuverte((o) => !o);
      }
    };
    window.addEventListener(OUVRIR_RECHERCHE, ouvrir);
    window.addEventListener("keydown", clavier);
    return () => {
      window.removeEventListener(OUVRIR_RECHERCHE, ouvrir);
      window.removeEventListener("keydown", clavier);
    };
  }, []);

  // Les zones ne sont lues qu'à la première ouverture (lecture partagée avec la carte).
  useEffect(() => {
    if (!ouverte || zones) return;
    setErreur(false);
    getZones()
      .then((z) => setZones(z.features.map((f) => f.properties)))
      .catch(() => setErreur(true));
  }, [ouverte, zones]);

  const resultats = useMemo<Resultat[]>(() => {
    const q = normaliser(requete.trim());
    const pages: Resultat[] = LIENS.filter(
      (l) => !q || normaliser(l.libelle).includes(q) || normaliser(l.description).includes(q),
    ).map((l) => ({
      type: "page",
      cle: l.href,
      libelle: l.libelle,
      detail: l.description,
      href: l.href,
      Icone: l.Icone,
    }));
    const trouvees: Resultat[] = (zones ?? [])
      .filter((z) => !q || normaliser(z.nom).includes(q) || normaliser(z.commune).includes(q))
      .sort((a, b) => (a.rang ?? Infinity) - (b.rang ?? Infinity))
      .slice(0, q ? 20 : 6)
      .map((z) => ({ type: "zone", cle: z.id, zone: z }));
    return q ? [...trouvees, ...pages] : [...pages, ...trouvees];
  }, [requete, zones]);

  useEffect(() => setActif(0), [requete]);

  function fermer() {
    setOuverte(false);
    setRequete("");
  }

  function choisir(r: Resultat) {
    fermer();
    router.push(r.type === "page" ? r.href : `/?zone=${encodeURIComponent(r.zone.id)}`);
  }

  function clavier(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const pas = e.key === "ArrowDown" ? 1 : -1;
      setActif((i) => (resultats.length ? (i + pas + resultats.length) % resultats.length : 0));
    } else if (e.key === "Enter" && resultats[actif]) {
      e.preventDefault();
      choisir(resultats[actif]);
    }
  }

  // Garde l'option active visible pendant la navigation au clavier.
  useEffect(() => {
    document.getElementById(`${liste}-${actif}`)?.scrollIntoView({ block: "nearest" });
  }, [actif, liste]);

  const pages = resultats.filter((r) => r.type === "page");
  const zonesTrouvees = resultats.filter((r) => r.type === "zone");

  const option = (r: Resultat) => {
    const i = resultats.indexOf(r);
    const courant = i === actif;
    return (
      <li
        key={`${r.type}-${r.cle}`}
        id={`${liste}-${i}`}
        role="option"
        aria-selected={courant}
        onPointerMove={() => setActif(i)}
        onClick={() => choisir(r)}
        className={cn(
          "flex min-h-cible cursor-pointer items-center gap-3 rounded-md px-3 py-2",
          courant ? "bg-primary-soft" : "hover:bg-surface-2",
        )}
      >
        {r.type === "page" ? (
          <>
            <r.Icone {...ICONE} className="shrink-0 text-ink-3" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink">{r.libelle}</span>
              <span className="block truncate text-petit text-ink-2">{r.detail}</span>
            </span>
          </>
        ) : (
          <>
            <MapPin {...ICONE} className="shrink-0 text-ink-3" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink">{r.zone.nom}</span>
              <span className="flex items-center gap-1.5 text-petit text-ink-2">
                <SymbolePriorite priorite={r.zone.priorite} />
                <span className="truncate">
                  {r.zone.commune} · {LIBELLE_PRIORITE[r.zone.priorite]}
                </span>
              </span>
            </span>
          </>
        )}
        {courant && <CornerDownLeft {...ICONE_PETITE} className="shrink-0 text-ink-3" aria-hidden />}
      </li>
    );
  };

  return (
    <Dialogue ouvert={ouverte} onFermer={fermer} titre="Rechercher une zone ou une page" initial={champ}>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search {...ICONE} className="shrink-0 text-ink-3" aria-hidden />
        <input
          ref={champ}
          role="combobox"
          aria-expanded="true"
          aria-controls={liste}
          aria-activedescendant={resultats[actif] ? `${liste}-${actif}` : undefined}
          aria-autocomplete="list"
          aria-label="Rechercher une zone ou une page"
          placeholder="Nom de zone, commune ou page…"
          value={requete}
          onChange={(e) => setRequete(e.target.value)}
          onKeyDown={clavier}
          className="min-h-14 flex-1 bg-transparent text-texte text-ink placeholder:text-ink-3 focus-visible:outline-none"
        />
        <kbd className="touche">Échap</kbd>
      </div>
      <ul id={liste} role="listbox" aria-label="Résultats" className="min-h-0 flex-1 overflow-y-auto p-2">
        {zonesTrouvees.length > 0 && requete && (
          <li role="presentation" className="px-3 pb-1 pt-2 text-surtitre uppercase text-ink-3">
            Zones
          </li>
        )}
        {requete && zonesTrouvees.map(option)}
        {pages.length > 0 && (
          <li role="presentation" className="px-3 pb-1 pt-2 text-surtitre uppercase text-ink-3">
            Pages
          </li>
        )}
        {pages.map(option)}
        {!requete && zonesTrouvees.length > 0 && (
          <li role="presentation" className="px-3 pb-1 pt-3 text-surtitre uppercase text-ink-3">
            Zones prioritaires
          </li>
        )}
        {!requete && zonesTrouvees.map(option)}
        {resultats.length === 0 && (
          <li
            role="presentation"
            className="flex flex-col items-center gap-2 px-4 py-8 text-center text-petit text-ink-2"
          >
            <SearchX {...ICONE} className="text-ink-3" aria-hidden />
            Aucune zone ni page ne correspond à « {requete} ».
          </li>
        )}
        {erreur && (
          <li role="presentation" className="px-3 py-2 text-petit text-ink-2">
            Les zones n&apos;ont pas pu être chargées : seule la recherche de pages est disponible.
          </li>
        )}
      </ul>
      <p className="hidden items-center gap-3 border-t border-line px-4 py-2 text-mention font-normal text-ink-3 sm:flex">
        <span className="inline-flex items-center gap-1">
          <kbd className="touche">↑</kbd>
          <kbd className="touche">↓</kbd> pour choisir
        </span>
        <span className="inline-flex items-center gap-1">
          <kbd className="touche">Entrée</kbd> pour ouvrir
        </span>
      </p>
    </Dialogue>
  );
}
