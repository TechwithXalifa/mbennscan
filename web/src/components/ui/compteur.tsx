"use client";

import { useEffect, useState } from "react";

/**
 * Nombre qui défile de 0 jusqu'à sa valeur en 600 ms, une seule fois à l'affichage.
 * Le lecteur d'écran lit directement la valeur finale ; rien ne bouge si l'utilisateur réduit les animations.
 */
export function Compteur({ valeur, format }: { valeur: number; format: (n: number) => string }) {
  const [affiche, setAffiche] = useState(valeur);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setAffiche(valeur);
    const debut = performance.now();
    let image = 0;
    const pas = (t: number) => {
      const p = Math.min(1, (t - debut) / 600);
      setAffiche(valeur * (1 - (1 - p) ** 3));
      if (p < 1) image = requestAnimationFrame(pas);
    };
    image = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(image);
  }, [valeur]);

  return (
    <>
      <span aria-hidden>{format(affiche)}</span>
      <span className="sr-only">{format(valeur)}</span>
    </>
  );
}
