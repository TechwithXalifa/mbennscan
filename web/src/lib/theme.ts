"use client";

import { useCallback, useSyncExternalStore } from "react";

// Thème de l'interface. Sombre par défaut ; le clair reste au choix (plus lisible en plein soleil).
// Le choix est gardé sur l'appareil.

export type Theme = "clair" | "sombre";

export const CLE_THEME = "mbennscan:theme";

/** Script exécuté avant l'affichage pour éviter un flash du mauvais thème. */
export const SCRIPT_THEME = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem("${CLE_THEME}")==="clair"?"clair":"sombre";}catch(e){document.documentElement.dataset.theme="sombre";}})();`;

function themeActuel(): Theme {
  return document.documentElement.dataset.theme === "clair" ? "clair" : "sombre";
}

// Un seul observateur pour toute la page, partagé par tous les composants qui lisent le thème.
const abonnes = new Set<() => void>();
let observateur: MutationObserver | null = null;

function abonner(rappel: () => void) {
  abonnes.add(rappel);
  if (!observateur) {
    observateur = new MutationObserver(() => abonnes.forEach((r) => r()));
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  return () => {
    abonnes.delete(rappel);
    if (abonnes.size === 0) {
      observateur?.disconnect();
      observateur = null;
    }
  };
}

/** Thème affiché (suit les changements faits ailleurs dans la page) et moyen d'en changer. */
export function useTheme() {
  // Côté serveur, le thème par défaut ; dans le navigateur, celui posé par SCRIPT_THEME.
  const theme = useSyncExternalStore<Theme>(abonner, themeActuel, () => "sombre");

  const choisir = useCallback((t: Theme) => {
    try {
      localStorage.setItem(CLE_THEME, t);
    } catch {
      // Stockage interdit : le choix vaut pour cette page seulement.
    }
    document.documentElement.dataset.theme = t;
  }, []);

  return { theme, choisir };
}
