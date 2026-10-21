import { VueCarte } from "@/components/carte/vue-carte";

// E1 · Carte « Avant la saison ». Le panneau du top 10 arrive dans la PR suivante.
export default function Accueil() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-topbar shrink-0 items-center border-b border-line bg-surface px-4">
        <h1 className="text-titre3">
          Mbënn<span className="text-primary">Scan</span>
        </h1>
      </header>
      <main className="relative flex flex-1">
        <VueCarte />
      </main>
    </div>
  );
}
