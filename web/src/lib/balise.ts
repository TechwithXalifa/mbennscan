// Repères de la balise, sans interface.

/** Niveau négatif : le capteur lit plus loin que le fond du bac. La mesure est fausse, ce n'est pas « 0 cm ». */
export function niveauValide(cm: number | null): cm is number {
  return cm !== null && Number.isFinite(cm) && cm >= 0;
}

/** Jusqu'où l'eau monterait sur un adulte de 1,75 m, en français courant. */
export function reperesCorps(cm: number): string {
  if (cm <= 0) return "Pas d'eau mesurée";
  if (cm < 15) return "L'eau arriverait aux chevilles d'un adulte";
  if (cm < 55) return "L'eau arriverait aux genoux d'un adulte";
  if (cm < 105) return "L'eau arriverait à la taille d'un adulte";
  if (cm < 140) return "L'eau arriverait à la poitrine d'un adulte";
  if (cm < 175) return "L'eau arriverait aux épaules d'un adulte";
  return "Un adulte serait entièrement submergé";
}
