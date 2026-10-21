"""Validation par des lieux inondés connus (issue #18).

Le satellite voit-il l'eau là où elle a été signalée ?

    python -m pipeline.validation

Lieux : data/validation/lieux_osm.geojson (OpenStreetMap, ODbL), figés avec leur identifiant OSM.
Pour chaque lieu localisé et chaque date : surface d'eau détectée (taches ≥ taille minimale) dans un
rayon de 200 m, et type de lieu. Écrit pipeline/out/validation/ : tableau (CSV et Markdown) et carte.
"""

from __future__ import annotations

import csv
import json
from dataclasses import dataclass

from pipeline import config, eau

LIEUX_PATH = config.DATA_DIR / "validation" / "lieux_osm.geojson"
RAYON_M = 200
DISTANCE_BORD_EAU_M = 300
PART_BATI_MIN = 0.5
TAILLE_MIN_PX = 10  # 0,1 ha ; deviendra PARAMETRES.taille_min_tache_px avec la PR de contrat
DATES = ("2020-10-06", "2022-08-21", "2026-10-06", "2026-10-12")
ANNEES_SECHES = range(2017, 2027)


@dataclass(frozen=True)
class Lieu:
    nom: str
    statut: str  # trouvé, approché, introuvable
    objet_osm: str | None
    osm: str | None
    note: str
    geometrie: dict | None


def charger_lieux(chemin=LIEUX_PATH) -> list[Lieu]:
    with chemin.open(encoding="utf-8") as f:
        fc = json.load(f)
    return [
        Lieu(p["lieu"], p["statut"], p["objet_osm"], p["osm"], p.get("note", ""), feat["geometry"])
        for feat in fc["features"]
        for p in [feat["properties"]]
    ]


def type_de_lieu(annees_eau_seche: list[int], part_bati: float | None) -> str:
    """Règle explicite, reprise dans la note.

    « Bord de lac ou cuvette » : au moins 0,1 ha d'eau en saison sèche à moins de 300 m, une année au
    moins de 2017 à 2026. Une cuvette qui s'assèche chaque année n'est donc pas reconnue comme telle."""
    if annees_eau_seche:
        return "bord de lac ou cuvette"
    if part_bati is not None and part_bati >= PART_BATI_MIN:
        return "tissu bâti"
    return "terrain ouvert"


def ligne_markdown(cellules: list[str]) -> str:
    return "| " + " | ".join(cellules) + " |"


def _ha(x: float) -> str:
    return f"{x:.2f}" if x >= 0.005 else "0"


# ── Earth Engine ─────────────────────────────────────────────────────────────
def _zone(lieu: Lieu, rayon_m: int = RAYON_M):
    import ee

    g = ee.Geometry(lieu.geometrie)
    if lieu.geometrie["type"] == "Point":
        return g.buffer(rayon_m)
    return g.buffer(rayon_m).difference(g, 1)  # « abords » : bande autour du contour


def _ha_image(eau_binaire, nom: str):
    import ee

    return eau_binaire.unmask(0).multiply(ee.Image.pixelArea()).divide(1e4).rename(nom)


def mesurer(lieux: list[Lieu], dates=DATES) -> list[dict]:
    """Par lieu : eau de saison sèche par année (300 m), bâti, eau nouvelle et présente par date (200 m)."""
    import ee

    from pipeline.inventaire import KEUR_MASSAR_BBOX

    geom = ee.Geometry.Rectangle(KEUR_MASSAR_BBOX).buffer(2000)
    terre = ee.ImageCollection(config.EE_DEM).select("WBM").mosaic().neq(1)
    seuil_sec = config.PARAMETRES.seuil_db_defaut
    valide = eau.masque_valide()
    localises = [lieu for lieu in lieux if lieu.geometrie]

    seche = ee.Image.cat(
        [
            _ha_image(
                eau.filtrer_taches(
                    eau.reference_seche(geom, a, eau.ORBITE_DEMO).lt(seuil_sec).And(terre), TAILLE_MIN_PX
                ),
                f"sec_{a}",
            )
            for a in ANNEES_SECHES
        ]
    )
    bandes = []
    for jour in dates:
        d = eau.detecter(geom, jour, eau.ORBITE_DEMO)
        vv = eau.image_du_jour(geom, jour, eau.ORBITE_DEMO)
        bandes.append(_ha_image(eau.filtrer_taches(d.eau, TAILLE_MIN_PX), f"nouv_{jour}"))
        bandes.append(
            _ha_image(eau.filtrer_taches(vv.lt(d.seuil_db).And(valide), TAILLE_MIN_PX), f"pres_{jour}")
        )
    bati = ee.ImageCollection("ESA/WorldCover/v200").first().eq(50).rename("part_bati")

    def zones(rayon):
        return ee.FeatureCollection(
            [ee.Feature(_zone(lieu, rayon), {"i": i}) for i, lieu in enumerate(localises)]
        )

    s300 = seche.reduceRegions(zones(DISTANCE_BORD_EAU_M), ee.Reducer.sum(), eau.ECHELLE_M)
    s200 = ee.Image.cat(bandes).reduceRegions(zones(RAYON_M), ee.Reducer.sum(), eau.ECHELLE_M)
    sb = bati.reduceRegions(zones(RAYON_M), ee.Reducer.mean(), eau.ECHELLE_M)
    res300, res200, resb = (fc.getInfo()["features"] for fc in (s300, s200, sb))

    resultats = []
    for i, lieu in enumerate(localises):
        p300 = next(f["properties"] for f in res300 if f["properties"]["i"] == i)
        p200 = next(f["properties"] for f in res200 if f["properties"]["i"] == i)
        pb = next(f["properties"] for f in resb if f["properties"]["i"] == i)
        annees = [a for a in ANNEES_SECHES if (p300.get(f"sec_{a}") or 0) >= 0.1]
        r = {"lieu": lieu.nom, "annees_eau_seche": annees, "part_bati": pb.get("mean")}
        r["type"] = type_de_lieu(annees, r["part_bati"])
        for jour in dates:
            r[f"nouv_{jour}"] = p200.get(f"nouv_{jour}") or 0
            r[f"pres_{jour}"] = p200.get(f"pres_{jour}") or 0
        resultats.append(r)
    return resultats


def ecrire(lieux: list[Lieu], resultats: list[dict], dates=DATES) -> None:
    sortie = config.out_dir() / "validation"
    sortie.mkdir(parents=True, exist_ok=True)
    par_nom = {r["lieu"]: r for r in resultats}

    with (sortie / "validation_lieux.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            ["lieu", "statut", "osm", "type", "annees_eau_saison_seche", "part_bati"]
            + [f"{k}_{d}" for d in dates for k in ("nouvelle_ha", "presente_ha")]
        )
        for lieu in lieux:
            r = par_nom.get(lieu.nom)
            if r is None:
                w.writerow([lieu.nom, lieu.statut, "", "", "", ""] + [""] * 2 * len(dates))
                continue
            w.writerow(
                [
                    lieu.nom,
                    lieu.statut,
                    lieu.osm,
                    r["type"],
                    " ".join(map(str, r["annees_eau_seche"])),
                    round(r["part_bati"] or 0, 2),
                ]
                + [round(r[f"{k}_{d}"], 2) for d in dates for k in ("nouv", "pres")]
            )

    entete = ["Lieu", "Localisation OSM", "Type de lieu"] + [f"{d} nouvelle / présente (ha)" for d in dates]
    lignes = [ligne_markdown(entete), ligne_markdown(["---"] * len(entete))]
    for lieu in lieux:
        r = par_nom.get(lieu.nom)
        if r is None:
            lignes.append(ligne_markdown([lieu.nom, f"introuvable ({lieu.note})", "–"] + ["–"] * len(dates)))
            continue
        type_ = r["type"]
        if r["annees_eau_seche"]:
            type_ += f" (eau en saison sèche : {', '.join(map(str, r['annees_eau_seche']))})"
        cellules = [f"{_ha(r[f'nouv_{d}'])} / {_ha(r[f'pres_{d}'])}" for d in dates]
        lignes.append(ligne_markdown([lieu.nom, f"{lieu.statut} : {lieu.objet_osm}", type_] + cellules))
    (sortie / "validation_lieux.md").write_text("\n".join(lignes) + "\n", encoding="utf-8")
    print("\n".join(lignes))


def carte(lieux: list[Lieu], jour: str, fond_s2: str, nom: str) -> None:
    """Carte PNG : image optique de fond, eau nouvelle du jour en bleu, lieux et cercles de 200 m."""
    import math
    import urllib.request

    import ee
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    from pipeline.inventaire import KEUR_MASSAR_BBOX

    lon0, lat0, lon1, lat1 = -17.35, 14.75, -17.27, 14.815
    region = ee.Geometry.Rectangle([lon0, lat0, lon1, lat1])
    geom = ee.Geometry.Rectangle(KEUR_MASSAR_BBOX).buffer(2000)
    s2 = (
        ee.ImageCollection(config.EE_S2)
        .filterBounds(region)
        .filterDate(fond_s2, ee.Date(fond_s2).advance(1, "day"))
    )
    fond = s2.mosaic().visualize(bands=["B4", "B3", "B2"], min=0, max=2500)
    eau_j = eau.filtrer_taches(eau.detecter(geom, jour, eau.ORBITE_DEMO).eau, TAILLE_MIN_PX)
    image = fond.blend(eau_j.visualize(palette=["2E90FA"]))
    url = image.getThumbURL({"region": region, "dimensions": 1600, "format": "png", "crs": "EPSG:4326"})
    sortie = config.out_dir() / "validation"
    sortie.mkdir(parents=True, exist_ok=True)
    png = sortie / f"{nom}_fond.png"
    urllib.request.urlretrieve(url, png)

    fig, ax = plt.subplots(figsize=(11, 9.5), dpi=150)
    ax.imshow(plt.imread(png), extent=[lon0, lon1, lat0, lat1], aspect=1 / math.cos(math.radians(14.78)))
    m_par_deg_lat = 111_320
    for lieu in lieux:
        if not lieu.geometrie or lieu.geometrie["type"] != "Point":
            continue
        lon, lat = lieu.geometrie["coordinates"]
        r_lat = RAYON_M / m_par_deg_lat
        r_lon = r_lat / math.cos(math.radians(lat))
        style = "-" if lieu.statut == "trouvé" else "--"
        ax.add_patch(
            matplotlib.patches.Ellipse(
                (lon, lat), 2 * r_lon, 2 * r_lat, fill=False, ec="#101828", lw=1.6, ls=style
            )
        )
        ax.annotate(
            lieu.nom.replace(" (Parcelles Assainies de Keur Massar)", ""),
            (lon, lat),
            xytext=(6, 6),
            textcoords="offset points",
            fontsize=8,
            color="#101828",
            bbox={"boxstyle": "round,pad=0.2", "fc": "white", "ec": "none", "alpha": 0.85},
        )
    ax.set_xlim(lon0, lon1)
    ax.set_ylim(lat0, lat1)
    ax.set_xlabel("longitude")
    ax.set_ylabel("latitude")
    ax.set_title(
        f"Eau nouvelle détectée par Sentinel-1 le {jour} (bleu, taches ≥ 0,1 ha) et lieux signalés inondés",
        fontsize=10,
    )
    fig.text(
        0.01,
        0.01,
        f"Fond : Sentinel-2 du {fond_s2}. Cercles : 200 m (trait plein = lieu trouvé dans OSM, "
        "pointillé = approché). Abords de Mbeubeuss : nord. Contient des données Copernicus Sentinel "
        "modifiées ; lieux © contributeurs OpenStreetMap (ODbL).",
        fontsize=7,
        wrap=True,
    )
    fig.savefig(sortie / f"{nom}.png", bbox_inches="tight")
    plt.close(fig)
    print("carte :", (sortie / f"{nom}.png").relative_to(config.RACINE))


def main() -> None:
    import ee

    ee.Initialize(project=config.lire_env("EE_PROJECT"))
    lieux = charger_lieux()
    ecrire(lieux, mesurer(lieux))
    carte(lieux, "2020-10-06", "2020-10-04", "carte_validation_2020")
    carte(lieux, "2026-10-12", "2026-10-13", "carte_validation_2026")


if __name__ == "__main__":
    main()
