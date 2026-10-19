#!/usr/bin/env python3
"""Vérifie que les données respectent les contrats de contracts/schemas/.

Usage :
    python scripts/validate_contracts.py              # valide contracts/mocks/
    python scripts/validate_contracts.py --dir pipeline/out   # valide une sortie réelle du pipeline

Les fichiers sont associés à un schéma par leur nom (voir FICHIERS ci-dessous).
Code de sortie 0 si tout est conforme, 1 sinon. Dépendance : pip install jsonschema
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

RACINE = Path(__file__).resolve().parent.parent
SCHEMAS = RACINE / "contracts" / "schemas"

# motif de nom de fichier -> schéma
FICHIERS = [
    ("zones.json", "zones.schema.json"),
    ("zone_detail_*.json", "zone_detail.schema.json"),
    ("evenements.json", "evenements.schema.json"),
    ("impacts_evenement_*.json", "impacts_evenement.schema.json"),
    ("balises.json", "balises.schema.json"),
    ("mesures.json", "mesures.schema.json"),
    ("mesure_entrante.json", "mesure_entrante.schema.json"),
    ("run_meta.json", "run_meta.schema.json"),
]


def charger(p: Path):
    with p.open(encoding="utf-8") as f:
        return json.load(f)


def registre() -> Registry:
    reg = Registry()
    for p in SCHEMAS.glob("*.schema.json"):
        s = charger(p)
        res = Resource.from_contents(s)
        reg = reg.with_resource(s["$id"], res).with_resource(p.name, res)
    return reg


def verifications_croisees(dossier: Path) -> list[str]:
    """Règles qu'un schéma JSON ne sait pas exprimer."""
    erreurs: list[str] = []
    zones_p = dossier / "zones.json"
    if not zones_p.exists():
        return erreurs
    zones = charger(zones_p)["features"]
    ids = [f["properties"]["id"] for f in zones]
    if len(ids) != len(set(ids)):
        erreurs.append("zones.json : identifiants de zone en double")
    rangs = sorted(f["properties"]["rang"] for f in zones if f["properties"]["rang"] is not None)
    if rangs != list(range(1, len(rangs) + 1)):
        erreurs.append(f"zones.json : les rangs doivent aller de 1 à {len(rangs)} sans trou ni doublon (reçu {rangs})")
    connus = set(ids)
    for p in dossier.glob("impacts_evenement_*.json"):
        for ligne in charger(p):
            if ligne["zone_id"] not in connus:
                erreurs.append(f"{p.name} : zone_id inconnue {ligne['zone_id']!r}")
    for p in dossier.glob("zone_detail_*.json"):
        d = charger(p)
        zid = d["zone"]["id"]
        if zid not in connus:
            erreurs.append(f"{p.name} : zone {zid!r} absente de zones.json")
        for s in d["indicateurs_saison"]:
            if s["zone_id"] != zid:
                erreurs.append(f"{p.name} : indicateur de l'année {s['annee']} rattaché à {s['zone_id']!r}")
            if s["images_inondees"] > s["images_valides"]:
                erreurs.append(f"{p.name} : {s['annee']} a plus d'images inondées que d'images valides")
    bal_p, mes_p = dossier / "balises.json", dossier / "mesures.json"
    if bal_p.exists() and mes_p.exists():
        hauteurs = {b["id"]: b["hauteur_capteur_cm"] for b in charger(bal_p)}
        for m in charger(mes_p):
            h = hauteurs.get(m["balise_id"])
            if h is None:
                erreurs.append(f"mesures.json : balise inconnue {m['balise_id']!r}")
            elif m["niveau_cm"] is not None and abs(m["niveau_cm"] - (h - m["distance_cm"])) > 0.05:
                erreurs.append(f"mesures.json : mesure {m['id']} : niveau_cm ≠ hauteur_capteur_cm - distance_cm")
    return erreurs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=str(RACINE / "contracts" / "mocks"))
    dossier = Path(ap.parse_args().dir)
    reg = registre()
    erreurs: list[str] = []
    vus = 0
    for motif, nom_schema in FICHIERS:
        schema = charger(SCHEMAS / nom_schema)
        val = Draft202012Validator(schema, registry=reg, format_checker=FormatChecker())
        for p in sorted(dossier.glob(motif)):
            vus += 1
            for e in val.iter_errors(charger(p)):
                chemin = "/".join(str(x) for x in e.absolute_path) or "(racine)"
                erreurs.append(f"{p.name} → {chemin} : {e.message}")
    erreurs += verifications_croisees(dossier)
    if vus == 0:
        print(f"Aucun fichier de contrat trouvé dans {dossier}")
        return 1
    if erreurs:
        print(f"✗ {len(erreurs)} erreur(s) dans {dossier} :")
        for e in erreurs:
            print("  -", e)
        return 1
    print(f"✓ {vus} fichier(s) conformes aux contrats ({dossier})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
