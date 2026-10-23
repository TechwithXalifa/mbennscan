"use client";

import { useCallback, useEffect, useState } from "react";

// Thème de l'interface. Sombre par défaut ; le clair reste au choix (plus lisible en plein soleil).
// Le choix est gardé sur l'appareil.

export type Theme = "clair" | "sombre";

export const CLE_THEME = "mbennscan:theme";

/** Script exécuté avant l'affichage pour éviter un flash du mauvais thème. */
export const SCRIPT_THEME = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem("${CLE_THEME}")==="clair"?"clair":"sombre";}catch(e){document.documentElement.dataset.theme="sombre";}})();`;

function themeActuel(): Theme {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "clair" ? "clair" : "sombre";
}

/** Thème affiché (suit les changements faits ailleurs dans la page) et moyen d'en changer. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("sombre");

  useEffect(() => {
    setTheme(themeActuel());
    const observateur = new MutationObserver(() => setTheme(themeActuel()));
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observateur.disconnect();
  }, []);

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
