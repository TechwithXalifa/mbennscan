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

/** « 6 octobre 2026 » à partir d'une date ISO. */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}
