from dataclasses import replace

import pytest

from pipeline import config, eau


def _bimodal():
    # Deux populations : eau vers -22 dB, sol vers -10 dB.
    centres = [x / 2 for x in range(-60, 1)]  # -30 à 0 dB par pas de 0,5
    effectifs = [100 if -24 <= c <= -20 else 300 if -12 <= c <= -8 else 1 for c in centres]
    return centres, effectifs


def test_otsu_separe_deux_populations():
    s = eau.seuil_otsu(*_bimodal())
    assert -20 < s < -12


def test_otsu_impossible():
    assert eau.seuil_otsu([], []) is None
    assert eau.seuil_otsu([-20.0], [5]) is None
    assert eau.seuil_otsu([-20.0, -10.0], [0, 0]) is None


@pytest.mark.parametrize(
    ("brut", "attendu"),
    [
        (-17.0, (-17.0, "otsu")),
        (-25.0, (-22, "borne_min")),
        (-9.0, (-14, "borne_max")),
        (None, (-18, "defaut")),
    ],
)
def test_borner(brut, attendu):
    assert eau.borner(brut) == attendu


def test_borner_suit_les_parametres():
    p = replace(config.PARAMETRES, seuil_db_min=-20, seuil_db_defaut=-17)
    assert eau.borner(-21.0, p) == (-20, "borne_min")
    assert eau.borner(None, p) == (-17, "defaut")


def test_dates_demo_sur_l_orbite_retenue():
    assert eau.ORBITE_DEMO == 133
    assert eau.DATES_DEMO == ("2026-10-06", "2026-10-12", "2026-10-18")


def test_type_de_lieu():
    from pipeline import validation

    assert validation.type_de_lieu([2019, 2020], 0.9) == "bord de lac ou cuvette"
    assert validation.type_de_lieu([], 0.7) == "tissu bâti"
    assert validation.type_de_lieu([], 0.2) == "terrain ouvert"
    assert validation.type_de_lieu([], None) == "terrain ouvert"


def test_lieux_figes():
    from pipeline import validation

    lieux = validation.charger_lieux()
    assert len(lieux) == 16
    assert {lieu.statut for lieu in lieux} == {"trouvé", "approché", "introuvable"}
    # Un lieu introuvable n'a jamais de coordonnées (jamais placé au hasard).
    assert all(lieu.geometrie is None for lieu in lieux if lieu.statut == "introuvable")
    assert all(lieu.osm for lieu in lieux if lieu.statut != "introuvable")
