import json

from jsonschema import Draft202012Validator, FormatChecker

from pipeline import config, inventaire


def test_image_vers_run_meta_conforme():
    p = {
        "system:index": "S1D_IW_GRDH_1SDV_20261006T191712",
        "date": "2026-10-06",
        "relativeOrbitNumber_start": 133,
        "platform_number": "D",
    }
    image = inventaire.image_vers_run_meta(p)
    assert image == {
        "id": "S1D_IW_GRDH_1SDV_20261006T191712",
        "date": "2026-10-06",
        "orbite_relative": 133,
        "satellite": "S1D",
    }
    schema = json.loads((config.RACINE / "contracts" / "schemas" / "run_meta.schema.json").read_text("utf-8"))
    item = schema["properties"]["images"]["items"]
    assert not list(Draft202012Validator(item, format_checker=FormatChecker()).iter_errors(image))


def test_keur_massar_dans_la_zone_etude():
    lon0, lat0, lon1, lat1 = config.zone_etude_bbox()
    k0, k1, k2, k3 = inventaire.KEUR_MASSAR_BBOX
    assert lon0 <= k0 < k2 <= lon1 and lat0 <= k1 < k3 <= lat1
