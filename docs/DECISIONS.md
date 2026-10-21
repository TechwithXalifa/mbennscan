# Journal des décisions

Une ligne par décision qui change l'architecture, un contrat ou le périmètre. La plus récente en haut.

| Date | Décision | Pourquoi | Qui |
| --- | --- | --- | --- |
| 2026-10-21 | `mesure_entrante` gagne `age_s` (entier facultatif, 0 à 86 400 s) ; la mesure est datée `ts = réception - age_s`, la file de la balise part dans l'ordre. La limite 1/s porte sur une nouvelle colonne `mesures.recu_le` (heure de réception) | Le serveur datait chaque mesure à sa réception : après une coupure Wi-Fi, la courbe était fausse et la jauge affichait d'anciens niveaux. Abandonner les anciennes mesures faisait perdre des données | Équipe |
| 2026-10-20 | Un suppléant par dossier dans `CODEOWNERS` (Aziz pour `pipeline/`, `scripts/` et la règle générale ; Khalifa pour `web/` et `firmware/`) | GitHub ne compte pas l'approbation de l'auteur : un propriétaire seul ne pouvait pas fusionner ses propres PR (#4 bloquée) | Khalifa |
| 2026-10-19 | Dépôt structuré autour de contrats JSON validés en CI, mocks marqués `[FICTIF]` | Permettre au web et au pipeline d'avancer en parallèle sans se bloquer | Équipe |
| 2026-10-19 | Zone d'étude envoyée à SENSAT-TRL : rectangle 14.715-14.835 N, 17.230-17.440 O (`data/zone_etude.geojson`) | Couvrir Keur Massar, Pikine et Guédiawaye avec une marge | Khalifa |
| 2026-10-17 | Indicateur unique « habitants-jours sous l'eau », classement par tiers, pas de score composite | Lisible par un maire, explicable au jury | Équipe |
| 2026-10-17 | Fréquence = images inondées ÷ images valides par hivernage | La cadence Sentinel-1 a varié (1 ou 2 satellites selon les années) | Équipe |
| 2026-10-17 | Persistance en trois classes : < 6 j ruissellement, 6-12 j intermédiaire, ≥ 12 j stagnation (nappe probable, à confirmer DGPRE) | Répondre à « pomper ou drainer ? » | Équipe |
| 2026-10-17 | Grille H3 résolution 9 tant que les limites de quartiers ne sont pas disponibles | Pas de limites de quartiers en libre accès | Équipe |
| 2026-10-17 | Calculs lourds hors ligne, application en lecture seule ; seule la balise est en temps réel | Rapide sur réseau mobile, pas de serveur de calcul | Équipe |
| 2026-10-17 | Hors périmètre : voix en wolof, délégués de quartier, alertes SMS, comptes, modèle prédictif | Trop risqué en 72 h ; recentrer sur la mesure observée | Équipe |
| 2026-10-17 | GAINDESAT cité seulement comme perspective (1A en fin de mission depuis janvier 2026) | Ne rien affirmer de faux devant SENSAT | Équipe |
