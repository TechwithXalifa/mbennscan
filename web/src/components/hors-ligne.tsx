"use client";

import { useEffect, useState } from "react";
import { Bandeau } from "@/components/ui/etats";
import { CLE_MAJ } from "@/lib/data";
import { formatDate } from "@/lib/format";

/**
 * Enregistre le service worker (en production) et affiche
 * « Vous êtes hors ligne : données du … affichées » quand le réseau tombe.
 */
export function HorsLigne() {
  const [horsLigne, setHorsLigne] = useState(false);
  const [maj, setMaj] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sans service worker, l'application marche en ligne comme avant.
      });
    }
    const maj = () => {
      setHorsLigne(!navigator.onLine);
      try {
        setMaj(localStorage.getItem(CLE_MAJ));
      } catch {
        setMaj(null);
      }
    };
    maj();
    window.addEventListener("online", maj);
    window.addEventListener("offline", maj);
    return () => {
      window.removeEventListener("online", maj);
      window.removeEventListener("offline", maj);
    };
  }, []);

  if (!horsLigne) return null;
  return (
    <Bandeau horsLigne className="rounded-none print:hidden">
      {maj
        ? `Vous êtes hors ligne : données du ${formatDate(maj)} affichées.`
        : "Vous êtes hors ligne : aucune donnée enregistrée sur cet appareil."}
    </Bandeau>
  );
}
