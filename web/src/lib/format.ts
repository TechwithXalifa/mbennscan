// Formats français (cahier des charges, section 9).

const nombre = new Intl.NumberFormat("fr-FR");
const pourcent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function formatNombre(n: number): string {
  return nombre.format(n);
}

/** Habitants toujours arrondis (dizaine sous 1 000, centaine au-delà). */
export function formatHabitants(n: number): string {
  const pas = n < 1000 ? 10 : 100;
  return nombre.format(Math.round(n / pas) * pas);
}

export function formatPourcent(fraction: number): string {
  return pourcent.format(fraction);
}

/** « il y a 4 s », « il y a 5 min », « il y a 2 h », « il y a 3 j ». */
export function formatDepuis(secondes: number): string {
  if (secondes < 60) return `il y a ${Math.floor(secondes)} s`;
  if (secondes < 3600) return `il y a ${Math.floor(secondes / 60)} min`;
  if (secondes < 86400) return `il y a ${Math.floor(secondes / 3600)} h`;
  return `il y a ${Math.floor(secondes / 86400)} j`;
}

/** « 6 octobre 2026 » à partir d'une date ISO. */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}
