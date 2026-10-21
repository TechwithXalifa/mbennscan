import { ListeZones } from "@/components/liste-zones";

// Socle : vérifie la couche de données. La carte E1 arrive dans la PR suivante.
export default function Accueil() {
  return (
    <main className="mx-auto max-w-[680px] px-4 py-6">
      <h1 className="text-titre1">
        Mbënn<span className="text-primary">Scan</span>
      </h1>
      <p className="mt-1 text-petit text-ink-2">Keur Massar · hivernages 2020-2026</p>
      <ListeZones />
    </main>
  );
}
