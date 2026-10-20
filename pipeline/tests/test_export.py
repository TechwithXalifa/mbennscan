import json
import re
from datetime import UTC, date, datetime

import pytest
from jsonschema import Draft202012Validator, FormatChecker

from pipeline import config, export

MOCKS = config.RACINE / "contracts" / "mocks"
SCHEMAS = config.RACINE / "contracts" / "schemas"


def _colonnes_sql() -> dict[str, set[str]]:
    """Colonnes de chaque table de supabase/schema.sql (hors contraintes)."""
    sql = (config.RACINE / "supabase" / "schema.sql").read_text(encoding="utf-8")
    tables = {}
    for nom, corps in re.findall(r"create table if not exists (\w+) \((.*?)\n\);", sql, re.S):
        cols = {ligne.split()[0] for ligne in corps.strip().splitlines() if ligne.strip()}
        tables[nom] = cols - {"primary", "check", "unique", "--"}
    return tables


@pytest.fixture(scope="module")
def lignes():
    return export.preparer(MOCKS)


def test_mocks_conformes():
    export.valider(MOCKS)


def test_nombre_de_lignes(lignes):
    zones = json.loads((MOCKS / "zones.json").read_text(encoding="utf-8"))["features"]
    assert len(lignes["zones"]) == len(lignes["syntheses"]) == len(zones)
    assert len(lignes["evenements"]) == 2
    assert len(lignes["impacts_evenement"]) == 3
    assert lignes["indicateurs_saison"]


def test_colonnes_conformes_a_schema_sql(lignes):
    sql = _colonnes_sql()
    for table, rows in lignes.items():
        for r in rows:
            assert set(r) <= sql[table], (table, set(r) - sql[table])


def test_ordre_des_tables(lignes):
    # Les clés étrangères imposent : zones avant syntheses/indicateurs, evenements avant impacts.
    ordre = list(lignes)
    assert ordre.index("zones") < ordre.index("syntheses") < ordre.index("impacts_evenement")
    assert ordre.index("evenements") < ordre.index("impacts_evenement")


def test_geometrie_en_ewkt(lignes):
    g = lignes["zones"][0]["geom"]
    assert g.startswith("SRID=4326;POLYGON ((")


def test_mocks_restent_fictifs(lignes):
    assert all(z["nom"].startswith("[FICTIF]") for z in lignes["zones"])


def test_dossier_invalide_refuse(tmp_path):
    (tmp_path / "zones.json").write_text('{"type": "FeatureCollection", "features": [{}]}', encoding="utf-8")
    with pytest.raises(SystemExit):
        export.valider(tmp_path)


def test_zones_obligatoires(tmp_path):
    with pytest.raises(SystemExit, match="zones.json"):
        export.preparer(tmp_path)


def test_run_meta_conforme(tmp_path):
    meta = export.construire_run_meta(
        images=[{"id": "S1A_TEST", "date": "2026-10-06", "orbite_relative": 125, "satellite": "S1A"}],
        sources=["Copernicus Sentinel-1"],
        periode_fin=date(2026, 10, 20),
        date_calcul=datetime(2026, 10, 20, 22, 0, tzinfo=UTC),
        version="abc123",
    )
    schema = json.loads((SCHEMAS / "run_meta.schema.json").read_text(encoding="utf-8"))
    assert not list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(meta))
    assert meta["date_calcul"] == "2026-10-20T22:00:00Z"
    p = export.ecrire_json("run_meta.json", meta, tmp_path)
    assert json.loads(p.read_text(encoding="utf-8")) == meta


def test_publier_run_meta(tmp_path):
    cible = tmp_path / "web" / "public" / "data" / "run_meta.json"
    assert export.publier_run_meta(MOCKS, cible) == cible
    assert cible.read_bytes() == (MOCKS / "run_meta.json").read_bytes()
    assert export.publier_run_meta(tmp_path, cible) is None  # dossier sans run_meta.json


class _FauxClient:
    """Enregistre les appels table(...).delete()/insert(...)...execute()."""

    def __init__(self):
        self.appels = []

    def table(self, nom):
        client = self

        class _Requete:
            def delete(self):
                client.appels.append(("delete", nom))
                return self

            def insert(self, rows):
                client.appels.append(("insert", nom, len(rows)))
                return self

            def neq(self, *_):
                return self

            def gte(self, *_):
                return self

            def execute(self):
                return None

        return _Requete()


def test_ecriture_remplace_tout(lignes, monkeypatch):
    monkeypatch.setattr(export, "TAILLE_LOT", 2)
    c = _FauxClient()
    export.ecrire_supabase(c, lignes)
    assert c.appels[:2] == [("delete", "zones"), ("delete", "evenements")]
    inserts = [a for a in c.appels if a[0] == "insert"]
    assert sum(a[2] for a in inserts if a[1] == "zones") == len(lignes["zones"])
    assert all(a[2] <= 2 for a in inserts)  # par lots
