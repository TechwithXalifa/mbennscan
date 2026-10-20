import json

import pytest

from pipeline import config

SCHEMA_RUN_META = config.RACINE / "contracts" / "schemas" / "run_meta.schema.json"


def _schema_parametres() -> dict:
    with SCHEMA_RUN_META.open(encoding="utf-8") as f:
        return json.load(f)["properties"]["parametres"]


def test_parametres_alignes_sur_le_contrat():
    schema = _schema_parametres()
    assert set(config.PARAMETRES.to_dict()) == set(schema["required"]) == set(schema["properties"])


def test_valeurs_par_defaut_du_contrat():
    schema = _schema_parametres()["properties"]
    for nom, valeur in config.PARAMETRES.to_dict().items():
        assert valeur == schema[nom]["default"], nom


def test_bornes_du_seuil_coherentes():
    p = config.PARAMETRES
    assert p.seuil_db_min <= p.seuil_db_defaut <= p.seuil_db_max
    assert p.persistance_courte_j < p.persistance_longue_j


def test_bbox_zone_etude():
    lon_min, lat_min, lon_max, lat_max = config.zone_etude_bbox()
    assert lon_min < lon_max and lat_min < lat_max
    assert -18 < lon_min < -17 and 14 < lat_min < 15  # banlieue de Dakar


def test_lire_env_absente(monkeypatch):
    monkeypatch.delenv("EE_PROJECT", raising=False)
    with pytest.raises(RuntimeError, match="EE_PROJECT"):
        config.lire_env("EE_PROJECT")
