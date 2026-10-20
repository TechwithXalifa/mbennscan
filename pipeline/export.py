"""Écrit les sorties du pipeline dans Supabase, après validation des contrats.

    python -m pipeline.export                          # pipeline/out (ou PIPELINE_OUT_DIR)
    python -m pipeline.export --depuis contracts/mocks # fil de bout en bout avec les mocks [FICTIF]
    python -m pipeline.export --sans-ecriture          # valide et convertit, sans toucher à Supabase

Les fichiers suivent contracts/schemas/ ; les lignes suivent supabase/schema.sql. L'écriture remplace
tout le contenu satellite (zones, synthèses, indicateurs, épisodes, impacts) : les mocks chargés
pour tester disparaissent dès la première vraie sortie. run_meta.json n'a pas de table.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

from shapely.geometry import shape

from pipeline import config

VALIDATEUR = config.RACINE / "scripts" / "validate_contracts.py"
TAILLE_LOT = 500


# ── Lecture et validation ────────────────────────────────────────────────────
def _charger(p: Path) -> Any:
    with p.open(encoding="utf-8") as f:
        return json.load(f)


def valider(dossier: Path) -> None:
    """Lance scripts/validate_contracts.py --dir ; lève une erreur si un fichier n'est pas conforme."""
    r = subprocess.run(
        [sys.executable, str(VALIDATEUR), "--dir", str(dossier)], capture_output=True, text=True
    )
    print(r.stdout, end="")
    if r.returncode != 0:
        raise SystemExit(f"Contrats non respectés dans {dossier} : rien n'est écrit.\n{r.stderr}")


# ── Conversion contrat → lignes de tables (fonctions pures) ──────────────────
COLONNES_ZONE = ("id", "nom", "commune", "population", "part_bati")
COLONNES_SYNTHESE = (
    "habitants_jours_an",
    "priorite",
    "rang",
    "classe_eau",
    "confiance",
    "batiments_touches",
    "ecoles_touchees",
    "ecoles_noms",
    "routes_km",
    "maj",
)


def geojson_vers_ewkt(geometrie: dict) -> str:
    """PostGIS accepte l'EWKT en entrée : c'est le format le plus sûr à travers l'API REST."""
    return f"SRID=4326;{shape(geometrie).wkt}"


def lignes_zones(zones: dict) -> tuple[list[dict], list[dict]]:
    """zones.json → (lignes de `zones`, lignes de `syntheses`)."""
    zs, ss = [], []
    for f in zones["features"]:
        p = f["properties"]
        zs.append({**{c: p[c] for c in COLONNES_ZONE}, "geom": geojson_vers_ewkt(f["geometry"])})
        ss.append({"zone_id": p["id"], **{c: p[c] for c in COLONNES_SYNTHESE}})
    return zs, ss


def lignes_indicateurs(details: list[dict]) -> list[dict]:
    """zone_detail_*.json → lignes de `indicateurs_saison` (la synthèse vient de zones.json)."""
    return [dict(s) for d in details for s in d["indicateurs_saison"]]


def lignes_evenements(evenements: list[dict]) -> list[dict]:
    return [dict(e) for e in evenements]


def lignes_impacts(impacts: list[list[dict]]) -> list[dict]:
    return [dict(i) for lot in impacts for i in lot]


def preparer(dossier: Path) -> dict[str, list[dict]]:
    """Toutes les lignes à écrire, par table, dans l'ordre des clés étrangères."""
    if not (dossier / "zones.json").exists():
        raise SystemExit(f"{dossier / 'zones.json'} manque : les autres tables en dépendent.")
    zones, syntheses = lignes_zones(_charger(dossier / "zones.json"))
    ev = dossier / "evenements.json"
    return {
        "zones": zones,
        "syntheses": syntheses,
        "indicateurs_saison": lignes_indicateurs(
            [_charger(p) for p in sorted(dossier.glob("zone_detail_*.json"))]
        ),
        "evenements": lignes_evenements(_charger(ev)) if ev.exists() else [],
        "impacts_evenement": lignes_impacts(
            [_charger(p) for p in sorted(dossier.glob("impacts_evenement_*.json"))]
        ),
    }


# ── run_meta.json ────────────────────────────────────────────────────────────
def version_pipeline() -> str:
    """Hash du commit courant, suffixé de « -modifie » si l'arbre de travail n'est pas propre."""
    git = ["git", "-C", str(config.RACINE)]
    h = subprocess.run([*git, "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
    sale = subprocess.run([*git, "status", "--porcelain", "--", "pipeline"], capture_output=True, text=True)
    return (h or "inconnue") + ("-modifie" if sale.stdout.strip() else "")


def construire_run_meta(
    images: list[dict],
    sources: list[str],
    periode_fin: date,
    date_calcul: datetime | None = None,
    version: str | None = None,
) -> dict:
    """Contenu de run_meta.json (contracts/schemas/run_meta.schema.json)."""
    return {
        "date_calcul": (date_calcul or datetime.now(UTC))
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z"),
        "version_pipeline": version if version is not None else version_pipeline(),
        "zone_etude_bbox": config.zone_etude_bbox(),
        "periode": {"debut": config.PERIODE_DEBUT.isoformat(), "fin": periode_fin.isoformat()},
        "parametres": config.PARAMETRES.to_dict(),
        "images": images,
        "sources": sources,
    }


def ecrire_json(nom: str, contenu: Any, dossier: Path | None = None) -> Path:
    """Écrit une sortie du pipeline (zones.json, run_meta.json…) dans le dossier de sortie."""
    dossier = dossier or config.out_dir()
    dossier.mkdir(parents=True, exist_ok=True)
    p = dossier / nom
    p.write_text(json.dumps(contenu, ensure_ascii=False, indent=1), encoding="utf-8")
    return p


# ── Écriture dans Supabase ───────────────────────────────────────────────────
def client_supabase():
    from supabase import create_client

    return create_client(config.lire_env("SUPABASE_URL"), config.lire_env("SUPABASE_SERVICE_ROLE_KEY"))


def ecrire_supabase(client, lignes: dict[str, list[dict]]) -> None:
    """Remplace le contenu satellite. Les suppressions en cascade vident synthèses, indicateurs, impacts."""
    client.table("zones").delete().neq("id", "").execute()
    client.table("evenements").delete().gte("id", 0).execute()
    for table, rows in lignes.items():
        for i in range(0, len(rows), TAILLE_LOT):
            client.table(table).insert(rows[i : i + TAILLE_LOT]).execute()
        print(f"  {table} : {len(rows)} ligne(s)")


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument(
        "--depuis", type=Path, default=None, help="dossier à exporter (défaut : PIPELINE_OUT_DIR)"
    )
    ap.add_argument("--sans-ecriture", action="store_true", help="valider et convertir sans écrire")
    args = ap.parse_args(argv)

    dossier = (args.depuis or config.out_dir()).resolve()
    valider(dossier)
    lignes = preparer(dossier)
    if args.sans_ecriture:
        for table, rows in lignes.items():
            print(f"  {table} : {len(rows)} ligne(s) (non écrites)")
        return
    print(f"Écriture dans Supabase depuis {dossier}")
    ecrire_supabase(client_supabase(), lignes)


if __name__ == "__main__":
    main()
