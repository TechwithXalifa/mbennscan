## Quoi

<!-- Une ou deux phrases. Lien vers l'issue : Closes #12 -->

## Pourquoi

## Comment tester

1.
2.

## Captures d'écran (web : mobile et ordinateur)

## Vérifications

- [ ] Branche à jour avec `main`, PR petite et ciblée
- [ ] `python scripts/validate_contracts.py` passe
- [ ] Aucun secret, aucune clé `service_role` côté web
- [ ] Aucune donnée inventée présentée comme réelle (les mocks restent `[FICTIF]`)
- [ ] Web : testé sur téléphone, états chargement / vide / erreur gérés
- [ ] Si un contrat change : schéma + mocks + `supabase/schema.sql` + accord de l'autre côté + ligne dans `docs/DECISIONS.md`
- [ ] README mis à jour si une commande ou une règle change
