"use client";

import { useCallback, useEffect, useState } from "react";

// Thème de l'interface. Clair par défaut (lisible en plein soleil, cahier des charges section 6) ;
// le sombre est un choix de l'utilisateur, gardé sur l'appareil.

export type Theme = "clair" | "sombre";
export type PreferenceTheme = Theme | "systeme";

export const CLE_THEME = "mbennscan:theme";

/** Script exécuté avant l'affichage pour éviter un flash du mauvais thème. */
export const SCRIPT_THEME = `(function(){try{var p=localStorage.getItem("${CLE_THEME}")||"clair";var s=p==="systeme"?(matchMedia("(prefers-color-scheme: dark)").matches?"sombre":"clair"):p;document.documentElement.dataset.theme=s==="sombre"?"sombre":"clair";}catch(e){document.documentElement.dataset.theme="clair";}})();`;

function lirePreference(): PreferenceTheme {
  try {
    const p = localStorage.getItem(CLE_THEME);
    return p === "sombre" || p === "systeme" ? p : "clair";
  } catch {
    return "clair";
  }
}

function resoudre(p: PreferenceTheme): Theme {
  if (p !== "systeme") return p;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
}

function themeActuel(): Theme {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "sombre" ? "sombre" : "clair";
}

/** Thème affiché (suit les changements faits ailleurs dans la page) et préférence de l'utilisateur. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("clair");
  const [preference, setPreference] = useState<PreferenceTheme>("clair");

  useEffect(() => {
    setTheme(themeActuel());
    setPreference(lirePreference());
    const observateur = new MutationObserver(() => {
      setTheme(themeActuel());
      setPreference(lirePreference());
    });
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observateur.disconnect();
  }, []);

  // « Système » : suivre le réglage de l'appareil tant que cette préférence est choisie.
  useEffect(() => {
    if (preference !== "systeme") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const suivre = () => (document.documentElement.dataset.theme = resoudre("systeme"));
    media.addEventListener("change", suivre);
    return () => media.removeEventListener("change", suivre);
  }, [preference]);

  const choisir = useCallback((p: PreferenceTheme) => {
    try {
      localStorage.setItem(CLE_THEME, p);
    } catch {
      // Stockage interdit : le choix vaut pour cette page seulement.
    }
    setPreference(p);
    document.documentElement.dataset.theme = resoudre(p);
  }, []);

  return { theme, preference, choisir };
}
