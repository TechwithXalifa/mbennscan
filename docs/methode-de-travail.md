# Méthode de travail — Khalifa × Aziz × Aboubacry

Ce document dit **comment nos trois parties se rejoignent** sans que personne n'attende personne. Les règles de Git (branches, commits, PR, secrets) sont dans [`CONTRIBUTING.md`](../CONTRIBUTING.md) ; ici, on explique le déroulé et le pourquoi. Il reprend la méthode de Gëstukaay (Khalifa × Aziz), adaptée à trois personnes et trois jours.

---

## 1. Le principe : se mettre d'accord sur la frontière, puis travailler sans s'attendre

Le piège à trois : Aziz attend les vraies zones pour faire la carte, Aboubacry attend l'écran Balise pour voir si sa mesure arrive, Khalifa attend la base pour tester l'écriture. On intègre tout le 22 au soir, et rien ne marche.

On l'évite avec trois outils, déjà en place :

1. **Les contrats** ([`contracts/`](../contracts/README.md)) : le format exact de chaque échange, écrit avant le code et vérifié par la CI.
2. **Les mocks `[FICTIF]`** (`NEXT_PUBLIC_USE_MOCKS=true`) : ils jouent le rôle du « faux moteur » de Gëstukaay. Aziz construit tous les écrans dessus dès le 20 au matin.
3. **L'intégration continue** : on fusionne dans `main` plusieurs fois par jour. Le jour où les vraies données sont dans Supabase, on change une variable d'environnement, pas une ligne de code.

> Règle d'or : **on intègre tôt et souvent.** Une petite fusion coûte 10 minutes ; une grosse fusion le dernier jour coûte la démo.

### Les deux frontières à surveiller

| Frontière | D'un côté | De l'autre | Contrats |
| --- | --- | --- | --- |
| Satellite → écran | Khalifa (pipeline → Supabase) | Aziz (E1 à E4, E6) | `zones`, `zone_detail`, `evenements`, `impacts_evenement`, `run_meta` |
| Balise → écran | Aboubacry (firmware → Edge Function `mesure`) | Aziz (E5) | `mesure_entrante`, `mesures`, `balises` |

Aziz est sur les deux frontières : c'est lui qu'on prévient en premier quand un format bouge.

---

## 2. Comment nos parties se rejoignent

| Étape | Quand | Ce qui se passe |
| --- | --- | --- |
| **1. Contrats figés** | 19 oct. (J0) | Schémas et mocks validés, `supabase/schema.sql` appliqué sur le projet Supabase. |
| **2. Fils de bout en bout** | 20 oct., avant le point de 19 h | **Fil satellite** : une sortie du pipeline passe `validate_contracts.py --dir pipeline/out`, est écrite dans Supabase et s'affiche sur E1 avec `NEXT_PUBLIC_USE_MOCKS=false`. **Fil balise** : un `curl` (puis l'ESP32) envoie une mesure à l'Edge Function, elle apparaît dans E5 par Realtime. Moche, mais complet, et déployé sur Vercel. |
| **3. Chacun remplit sa partie** | 20-21 oct. | Aziz : écrans, états, mobile, sur les mocks. Khalifa : série 2020-2026, indicateurs, classement. Aboubacry : médiane, renvoi des mesures en attente, étalonnage. |
| **4. Bascule** | dès que la première vraie zone existe | La préproduction Vercel passe en `NEXT_PUBLIC_USE_MOCKS=false`. Les mocks restent pour le développement local et la CI. |
| **5. Démo répétée** | 21 et 22 oct., chaque soir | Le parcours de 30 s (cahier des charges, section 7) est joué sur téléphone, avec les vraies données. Ce qui casse devient une issue. |

Les **fils de bout en bout (étape 2)** sont **la** priorité du 20 octobre, avant toute page soignée ou tout calcul complet. Tant qu'ils n'existent pas, on ne sait pas si nos morceaux s'emboîtent. Pour tester le fil satellite avant les vrais résultats, on peut charger les mocks dans Supabase : ils restent marqués `[FICTIF]` et sont remplacés dès la première vraie sortie.

---

## 3. Le rythme de fusion

- **Chacun fusionne au moins une PR avant chaque point** (9 h et 19 h GMT). Une branche ouverte depuis plus d'une demi-journée est une tâche trop grosse : on la découpe.
- Si `main` a avancé pendant qu'on travaille : `git fetch origin && git rebase origin/main`, puis `git push --force-with-lease` (jamais `--force` tout court).
- **Le 22 octobre à 12 h**, toute branche en cours est fusionnée ou abandonnée. À 16 h, gel : seulement des corrections.

> Leçon de Gëstukaay : quinze branches ont été fusionnées d'un coup dans une branche d'intégration, deux heures avant le rendu. Tout a tenu, de justesse. On ne refait pas ça : les règles ci-dessus servent à l'éviter.

---

## 4. Relire le code des autres

**Délai** : moins d'une heure en journée. Une PR qui attend bloque son auteur ; on prévient sur le groupe quand une PR attend.

**Pas de fusion sans relecture** : `main` est protégée (une approbation, dont celle du propriétaire du dossier selon `.github/CODEOWNERS`, et CI verte). Si personne ne relit dans l'heure, on relance sur le groupe plutôt que de contourner. Les PR de contrat attendent **toujours** l'accord du producteur et du consommateur.

**Quoi regarder** (pas le style : la CI s'en charge) :

1. Est-ce que ça respecte le contrat et nos engagements : aucun chiffre inventé, mocks toujours `[FICTIF]`, habitants arrondis, pas de clé `service_role` dans `web/` ?
2. Est-ce que ça casse quelque chose de mon côté ?
3. Est-ce que je comprends ce que ça fait ? Sinon, une question en commentaire.

On formule : « **Bloquant :** … » (à corriger avant fusion) ou « **Suggestion :** … » (libre).

---

## 5. Se parler : le minimum qui suffit

| Quoi | Où | Quand |
| --- | --- | --- |
| **Point** (10 min, visio) | Google Meet | 9 h et 19 h GMT. Trois questions : fait ? à faire ? qu'est-ce qui me bloque ? |
| **Tâches** | GitHub Projects « Hackathon » (À faire · En cours · En relecture · Terminé) | Une tâche = une issue. La PR contient `Closes #N` : l'issue se ferme toute seule à la fusion. |
| **Discussions techniques** | Commentaires de l'issue ou de la PR | Elles restent attachées au code. |
| **Décisions** | Une ligne dans [`docs/DECISIONS.md`](DECISIONS.md) | Le jour même, dès qu'on tranche quelque chose qui engage un autre membre. |
| **Urgences** | Groupe WhatsApp | « La préprod est cassée », « je suis bloqué ». Pas pour décider. |

> Une décision prise au téléphone et non écrite n'existe pas. Elle sera oubliée ou comprise différemment.

**Signaler un blocage tout de suite**, pas au point suivant. « Je bloque sur X depuis 30 min » est un message normal, pas un aveu.

---

## 6. Mise en place (J0, 19 octobre)

**Khalifa :**

1. Inviter Aziz et Aboubacry sur `TechwithXalifa/mbennscan` avec le rôle **Maintain**.
2. Protéger `main` (*Settings → Branches*) : PR obligatoire, 1 approbation dont celle du propriétaire du dossier, CI verte obligatoire, pas de push direct, historique linéaire (fusion par « Squash and merge » uniquement).
3. Remplir `.github/CODEOWNERS` avec les identifiants GitHub : `@TechwithXalifa`, `@abdlaziz221`, `@assidikh04`.
4. Créer le tableau GitHub Projects et les issues du 20 octobre (cahier des charges, section 10).

**Aziz et Aboubacry :**

1. `git clone`, puis `pip install jsonschema && python scripts/validate_contracts.py` (tout doit être vert).
2. Lire [`contracts/README.md`](../contracts/README.md) et les mocks de leur frontière.
3. Ouvrir une première PR courte : squelette `web/` sur les mocks pour Aziz ; Edge Function `mesure` et un `curl` qui passe pour Aboubacry.

**Les trois :** premier point pour valider ce document, le cahier des charges et les contrats.
