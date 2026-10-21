"""Détection de l'eau Sentinel-1 (cahier des charges, section 4, étapes 2 à 4 ; issue #12).

    python -m pipeline.eau                                  # images de l'épisode de démonstration
    python -m pipeline.eau --dates 2026-10-06 --orbite 133  # autres dates

Pour chaque date : mosaïque des tranches de l'orbite, filtre de chatoiement, comparaison avec la
référence sèche (médiane février-mai de la même orbite et de la même année), seuil d'Otsu borné,
masques eau permanente et pentes. Écrit pipeline/out/eau_<date>.geojson et affiche les surfaces.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import date

from pipeline import config

# Épisode retenu (DECISIONS.md, 2026-10-21) : orbite 133 ascendante, images après les pluies du 3-8 octobre.
ORBITE_DEMO = 133
DATES_DEMO = ("2026-10-06", "2026-10-12", "2026-10-18")
ECHELLE_M = 10
TOLERANCE_SIMPLIFICATION_M = 10


# ── Fonctions pures ──────────────────────────────────────────────────────────
def seuil_otsu(centres: list[float], effectifs: list[float]) -> float | None:
    """Seuil d'Otsu sur un histogramme : maximise la variance inter-classes. None si impossible."""
    total = sum(effectifs)
    if total <= 0 or len(centres) < 2:
        return None
    somme = sum(c * n for c, n in zip(centres, effectifs, strict=True))
    meilleur, seuil = -1.0, None
    poids_bas = somme_bas = 0.0
    for c, n in zip(centres[:-1], effectifs[:-1], strict=True):
        poids_bas += n
        somme_bas += c * n
        poids_haut = total - poids_bas
        if poids_bas == 0 or poids_haut == 0:
            continue
        ecart = somme_bas / poids_bas - (somme - somme_bas) / poids_haut
        variance = poids_bas * poids_haut * ecart * ecart
        if variance > meilleur:
            meilleur, seuil = variance, c
    return seuil


def borner(seuil: float | None, p: config.Parametres = config.PARAMETRES) -> tuple[float, str]:
    """Seuil retenu et son origine : Otsu dans les bornes, Otsu ramené à une borne, ou défaut."""
    if seuil is None:
        return p.seuil_db_defaut, "defaut"
    if seuil < p.seuil_db_min:
        return p.seuil_db_min, "borne_min"
    if seuil > p.seuil_db_max:
        return p.seuil_db_max, "borne_max"
    return seuil, "otsu"


# ── Earth Engine ─────────────────────────────────────────────────────────────
def _s1(geom, orbite: int):
    import ee

    return (
        ee.ImageCollection(config.EE_S1)
        .filterBounds(geom)
        .filter(ee.Filter.eq("instrumentMode", "IW"))
        .filter(ee.Filter.eq("relativeOrbitNumber_start", orbite))
        .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VH"))
        .select("VV")
    )


def _filtre_chatoiement(im):
    """Médiane 3 × 3 (en dB : la médiane ne dépend pas de l'échelle, linéaire ou logarithmique)."""
    return im.focalMedian(radius=1, kernelType="square", units="pixels")


def image_du_jour(geom, jour: str, orbite: int):
    """Mosaïque des tranches de l'orbite acquises ce jour-là, filtrée."""
    import ee

    d = ee.Date(jour)
    col = _s1(geom, orbite).filterDate(d, d.advance(1, "day"))
    return _filtre_chatoiement(col.mosaic()).set("nb_tranches", col.size())


def reference_seche(geom, annee: int, orbite: int):
    """Médiane février-mai de la même orbite et de la même année, chaque image filtrée."""
    mois = config.MOIS_REFERENCE_SECHE
    debut, fin = f"{annee}-{mois[0]:02d}-01", f"{annee}-{mois[-1] + 1:02d}-01"
    return _s1(geom, orbite).filterDate(debut, fin).map(_filtre_chatoiement).median()


def masque_valide(p: config.Parametres = config.PARAMETRES):
    """1 là où l'eau peut être détectée : hors eau permanente JRC et hors pentes fortes."""
    import ee

    permanente = ee.Image(config.EE_JRC).select("occurrence").gt(p.occurrence_eau_permanente_min)
    dem = ee.ImageCollection(config.EE_DEM).select("DEM").mosaic().setDefaultProjection("EPSG:4326", None, 30)
    pente = ee.Terrain.slope(dem)
    return permanente.unmask(0).Not().And(pente.lte(p.pente_max_deg))


def histogramme(vv, geom) -> tuple[list[float], list[float]]:
    import ee

    h = vv.reduceRegion(
        ee.Reducer.histogram(maxBuckets=256, minBucketWidth=0.1), geom, 20, maxPixels=1e9, bestEffort=True
    ).get("VV")
    h = ee.Dictionary(h).getInfo()
    largeur = h["bucketWidth"]
    centres = [h["bucketMin"] + largeur * (i + 0.5) for i in range(len(h["histogram"]))]
    return centres, h["histogram"]


@dataclass
class Detection:
    jour: str
    seuil_db: float
    origine_seuil: str
    eau: object  # ee.Image binaire (1 = eau), masquée ailleurs


def detecter(geom, jour: str, orbite: int, p: config.Parametres = config.PARAMETRES) -> Detection:
    """Eau nouvelle d'une date : VV sous le seuil, baisse ≥ baisse_min_db par rapport à la référence
    sèche, et pas déjà de l'eau dans cette référence. Sans cette dernière condition, un lac calme le
    jour de l'image (plus sombre qu'en saison sèche, où le vent le ride) passerait pour une inondation :
    c'est le cas des lacs de Mbeubeuss et de Malika, trop récents pour le masque JRC."""
    vv = image_du_jour(geom, jour, orbite)
    ref = reference_seche(geom, int(jour[:4]), orbite)
    seuil, origine = borner(seuil_otsu(*histogramme(vv, geom)), p)
    nouvelle = vv.lt(seuil).And(ref.gte(seuil)).And(ref.subtract(vv).gte(p.baisse_min_db))
    eau = nouvelle.And(masque_valide(p))
    return Detection(jour, seuil, origine, eau.selfMask().rename("eau").clip(geom))


def surface_km2(eau, geom) -> float:
    import ee

    s = eau.multiply(ee.Image.pixelArea()).reduceRegion(ee.Reducer.sum(), geom, ECHELLE_M, maxPixels=1e9)
    return (s.get("eau").getInfo() or 0) / 1e6


def polygones(eau, geom) -> dict:
    """Eau vectorisée, simplifiée à 10 m (FeatureCollection GeoJSON du contrat evenements)."""
    vecteurs = eau.reduceToVectors(
        geometry=geom, scale=ECHELLE_M, geometryType="polygon", eightConnected=False, maxPixels=1e9
    ).map(lambda f: f.simplify(TOLERANCE_SIMPLIFICATION_M).select([]))
    fc = vecteurs.getInfo()
    return {"type": "FeatureCollection", "features": fc["features"]}


def main(argv: list[str] | None = None) -> None:
    import ee

    from pipeline.inventaire import KEUR_MASSAR_BBOX

    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dates", nargs="+", default=list(DATES_DEMO))
    ap.add_argument("--orbite", type=int, default=ORBITE_DEMO)
    ap.add_argument("--sans-polygones", action="store_true", help="surfaces seulement")
    args = ap.parse_args(argv)

    ee.Initialize(project=config.lire_env("EE_PROJECT"))
    geom = ee.Geometry.Rectangle(KEUR_MASSAR_BBOX)
    sortie = config.out_dir()
    sortie.mkdir(parents=True, exist_ok=True)
    for jour in args.dates:
        date.fromisoformat(jour)  # format AAAA-MM-JJ
        d = detecter(geom, jour, args.orbite)
        km2 = surface_km2(d.eau, geom)
        print(f"{jour}  seuil {d.seuil_db:.2f} dB ({d.origine_seuil})  eau {km2:.3f} km²")
        if not args.sans_polygones:
            fc = polygones(d.eau, geom)
            p = sortie / f"eau_{jour}.geojson"
            p.write_text(json.dumps(fc), encoding="utf-8")
            print(f"  {len(fc['features'])} polygone(s) → {p.relative_to(config.RACINE)}")


if __name__ == "__main__":
    main()
