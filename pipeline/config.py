"""Paramètres du pipeline, centralisés ici et recopiés dans run_meta.json.

`Parametres` reprend exactement `parametres` de contracts/schemas/run_meta.schema.json
(tests/test_config.py vérifie l'alignement). Un paramètre qui doit apparaître dans
run_meta.json passe donc par un changement de contrat (contracts/README.md).
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

RACINE = Path(__file__).resolve().parent.parent
PIPELINE_DIR = RACINE / "pipeline"
DATA_DIR = RACINE / "data"
ZONE_ETUDE_PATH = DATA_DIR / "zone_etude.geojson"

load_dotenv(PIPELINE_DIR / ".env")


@dataclass(frozen=True)
class Parametres:
    """Paramètres de calcul (cahier des charges, section 4). Valeurs par défaut du contrat."""

    seuil_pluie_mm: float = 30  # épisode : pluie ≥ ce cumul en 24 h
    seuil_db_defaut: float = -18  # seuil VV si Otsu échoue
    seuil_db_min: float = -22  # bornes du seuil d'Otsu
    seuil_db_max: float = -14
    baisse_min_db: float = 3  # baisse minimale par rapport à la référence sèche
    part_zone_inondee_min: float = 0.05  # zone « inondée » si ≥ 5 % de sa surface valide est en eau
    h3_resolution: int = 9
    persistance_courte_j: float = 6  # < 6 j : ruissellement
    persistance_longue_j: float = 12  # ≥ 12 j : stagnation
    occurrence_eau_permanente_min: float = 50  # occurrence JRC (%) au-delà de laquelle on masque
    pente_max_deg: float = 5

    def to_dict(self) -> dict:
        return asdict(self)


PARAMETRES = Parametres()

# ── Période ──────────────────────────────────────────────────────────────────
ANNEES = range(2020, 2027)  # hivernages 2020 à 2026
MOIS_HIVERNAGE = (7, 8, 9, 10)  # juillet à octobre
MOIS_REFERENCE_SECHE = (2, 3, 4, 5)  # février à mai : médiane par orbite et par année
PERIODE_DEBUT = date(2020, 2, 1)
DATE_EVENEMENT_IMPOSE = date(2026, 10, 4)

# ── Collections Earth Engine (cahier des charges, section 4) ─────────────────
EE_S1 = "COPERNICUS/S1_GRD"
EE_S2 = "COPERNICUS/S2_SR_HARMONIZED"
EE_CHIRPS = "UCSB-CHG/CHIRPS/DAILY"
EE_GPM = "NASA/GPM_L3/IMERG_V07"
EE_DEM = "COPERNICUS/DEM/GLO30_2024_1"
EE_JRC = "JRC/GSW1_4/GlobalSurfaceWater"

# ── Actions suggérées (contrat impacts_evenement.action_suggeree) ────────────
ACTIONS = ("pomper", "recenser", "visiter")
# Stagnation durable (≥ persistance_longue_j) : remontée de nappe probable, pomper seul ne suffit pas
# (cahier des charges, section 7, E2). Le contrat n'a qu'une action par zone : « pomper » y est exclu.
ACTIONS_EXCLUES = {"stagnation": frozenset({"pomper"})}


def actions_permises(classe_eau: str | None) -> tuple[str, ...]:
    """Actions que le pipeline peut suggérer pour une zone de cette classe d'eau."""
    exclues = ACTIONS_EXCLUES.get(classe_eau, frozenset())
    return tuple(a for a in ACTIONS if a not in exclues)


def zone_etude_bbox(chemin: Path = ZONE_ETUDE_PATH) -> list[float]:
    """Emprise de la zone d'étude : [lon_min, lat_min, lon_max, lat_max] (ordre de run_meta)."""
    with chemin.open(encoding="utf-8") as f:
        p = json.load(f)["features"][0]["properties"]
    return [p["lon_min"], p["lat_min"], p["lon_max"], p["lat_max"]]


def lire_env(nom: str) -> str:
    """Variable de pipeline/.env ; erreur claire si elle manque."""
    valeur = os.environ.get(nom, "").strip()
    if not valeur:
        raise RuntimeError(f"{nom} manque : copier pipeline/.env.example en pipeline/.env et le remplir")
    return valeur


def out_dir() -> Path:
    """Dossier des sorties (PIPELINE_OUT_DIR, relatif à la racine du dépôt)."""
    return RACINE / os.environ.get("PIPELINE_OUT_DIR", "pipeline/out")
