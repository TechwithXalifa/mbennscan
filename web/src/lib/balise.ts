// Repères de la balise, sans interface.

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
