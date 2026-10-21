"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getEvenements } from "@/lib/data";

// /apres ouvre l'épisode le plus récent.
export default function DernierEpisode() {
  const router = useRouter();
  const [message, setMessage] = useState("Chargement des épisodes…");

  useEffect(() => {
    getEvenements()
      .then((e) => (e[0] ? router.replace(`/apres/${e[0].id}`) : setMessage("Aucun épisode de pluie calculé.")))
      .catch(() => setMessage("Impossible de charger les épisodes."));
  }, [router]);

  return <p className="p-4">{message}</p>;
}
