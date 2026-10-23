import type { Metadata } from "next";
import { TableauZones } from "@/components/zones/tableau-zones";

export const metadata: Metadata = { title: "Zones prioritaires · MbënnScan" };

// Classement complet des zones (fonctions F3 et F8 du cahier des charges), alternative accessible à la carte.
export default function PageZones() {
  return (
    <main className="halo-entete flex-1 px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <TableauZones />
      </div>
    </main>
  );
}
