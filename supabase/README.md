# supabase/

Base de données PostgreSQL + PostGIS, API REST automatique, temps réel pour la balise.

## Installer le schéma

1. Créer un projet sur supabase.com (région la plus proche : Europe).
2. *SQL Editor* → coller `schema.sql` → *Run*. Le script peut être relancé sans erreur. Base déjà créée avant `age_s` : relancer `schema.sql` ajoute la colonne `mesures.recu_le` (heure de réception, utilisée pour la limite 1/s). Redéployer ensuite la fonction (`supabase functions deploy mesure`) **avant** de flasher la balise : un ancien serveur refuse `age_s` (400).
3. Récupérer dans *Project Settings → API* : l'URL, la clé `anon` (pour `web/.env.local`) et la clé `service_role` (pour `pipeline/.env` uniquement).

Le schéma a été testé sur PostgreSQL 16 + PostGIS 3 avec les mocks : `zones_geojson()` renvoie un résultat conforme à `contracts/schemas/zones.schema.json`, le trigger calcule `niveau_cm`, le rôle `anon` lit tout sauf la clé des balises et ne peut rien écrire.

## Ce qui est exposé

| Lecture côté web | Contrat |
| --- | --- |
| `rpc/zones_geojson` | `zones.schema.json` |
| `zones`, `syntheses`, `indicateurs_saison` | `zone_detail.schema.json` (assemblé côté web) |
| `evenements`, `impacts_evenement` | `evenements.schema.json`, `impacts_evenement.schema.json` |
| `balises_publiques` (vue sans la clé) | `balises.schema.json` |
| `mesures` + Realtime | `mesures.schema.json` |

## À faire

- [x] Edge Function `functions/mesure/index.ts` (Aboubacry) : vérifier `Authorization: Bearer <clé>` contre `balises.cle_api_hash` (SHA-256), valider le corps avec `mesure_entrante.schema.json`, insérer avec la clé `service_role`, limiter à une mesure par seconde. Réponses 201 / 400 / 401 / 429.
- [x] Script d'enregistrement d'une balise (génère la clé, stocke son hachage) : voir ci-dessous.

## Enregistrer une balise

```bash
python scripts/enregistrer_balise.py --id bal-01 --nom "Bac de démonstration" --lon -17.315 --lat 14.78 --hauteur 80 --seuil 40
```

Le script n'a besoin d'aucune clé Supabase. Il affiche le SQL à coller dans *SQL Editor* (qui stocke le hachage SHA-256 de la clé), la clé à mettre dans `firmware/include/secrets.h` et un `curl` d'essai. La clé n'est affichée qu'une fois : la transmettre en privé. Relancer le script pour une balise existante remplace sa clé.
