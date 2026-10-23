// Repères de la balise, sans interface.

/** Niveau négatif : le capteur lit plus loin que le fond du bac. La mesure est fausse, ce n'est pas « 0 cm ». */
export function niveauValide(cm: number | null): cm is number {
  return cm !== null && Number.isFinite(cm) && cm >= 0;
}

// Hauteurs approchées sur un adulte de 1,75 m, du bas vers le haut.
const REPERES: [number, string][] = [
  [8, "sous la cheville d'un adulte"],
  [20, "à peu près la hauteur d'une cheville d'adulte"],
  [40, "entre la cheville et le genou d'un adulte"],
  [60, "à peu près la hauteur d'un genou d'adulte"],
  [85, "entre le genou et la hanche d'un adulte"],
  [105, "à peu près la hauteur d'une hanche d'adulte"],
  [135, "entre la hanche et l'épaule d'un adulte"],
  [155, "à peu près la hauteur d'une épaule d'adulte"],
  [175, "entre l'épaule et le haut de la tête d'un adulte"],
];

/**
 * Le niveau comparé à un adulte de 1,75 m, pour se représenter le chiffre : une comparaison de hauteur,
 * pas l'eau d'une rue (la balise mesure un bac). Rien à comparer sans eau.
 */
export function repereHumain(cm: number): string | null {
  if (cm <= 0) return null;
  return REPERES.find(([sous]) => cm < sous)?.[1] ?? "plus haut qu'un adulte de 1,75 m";
}
