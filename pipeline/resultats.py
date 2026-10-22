"""Résultats réels pour le dossier (#27, #18) : séquence d'octobre 2026, série 2020-2026, sensibilité.

    python -m pipeline.resultats

Écrit pipeline/out/resultats/ : tableaux Markdown et cartes PNG. Tout sort d'Earth Engine ; les
paramètres sont ceux de config.py, plus la taille minimale des taches (0,1 ha).
"""

from __future__ import annotations

import math
import urllib.request

from pipeline import config, eau
from pipeline.validation import TAILLE_MIN_PX, ligne_markdown

ANNEES = range(2020, 2027)
TAILLES_PX = (5, 10, 20)  # 0,05 / 0,1 / 0,2 ha
SEUILS_DB = (None, -16.0, -18.0, -20.0)  # None = Otsu borné
BAISSES_DB = (2.0, 3.0, 4.0)
DATES_SENSIBILITE = ("2020-10-06", "2026-10-06", "2026-10-12")


def _sortie():
    d = config.out_dir() / "resultats"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _km(geom):
    import ee

    from pipeline.inventaire import KEUR_MASSAR_BBOX

    return ee.Geometry.Rectangle(KEUR_MASSAR_BBOX)


def _surface_km2(eau_binaire, geom):
    import ee

    s = eau_binaire.unmask(0).multiply(ee.Image.pixelArea())
    return ee.Number(
        s.reduceRegion(ee.Reducer.sum(), geom, eau.ECHELLE_M, maxPixels=1e9).values().get(0)
    ).divide(1e6)


def _eau(geom, jour, seuil=None, baisse=None, taille_px=TAILLE_MIN_PX):
    """Eau nouvelle avec des réglages modifiés (sensibilité) ; seuil None = Otsu borné."""
    p = config.PARAMETRES
    vv = eau.image_du_jour(geom, jour, eau.ORBITE_DEMO)
    ref = eau.reference_seche(geom, int(jour[:4]), eau.ORBITE_DEMO)
    if seuil is None:
        seuil, _ = eau.borner(eau.seuil_otsu(*eau.histogramme(vv, geom)), p)
    b = p.baisse_min_db if baisse is None else baisse
    nouvelle = vv.lt(seuil).And(ref.gte(seuil)).And(ref.subtract(vv).gte(b)).And(eau.masque_valide(p))
    return eau.filtrer_taches(nouvelle, taille_px)


def serie() -> str:
    """Eau nouvelle par image de l'orbite 133, juillet à octobre, et pluie CHIRPS juillet-septembre."""
    import ee

    from pipeline.inventaire import lister_images_s1

    km = _km(None)
    lignes = [
        ligne_markdown(
            [
                "Hivernage",
                "Images",
                "Eau nouvelle max (km²)",
                "Date du max",
                "Médiane (km²)",
                "Pluie CHIRPS juil.-sept. (mm)",
            ]
        ),
        ligne_markdown(["---"] * 6),
    ]
    for an in ANNEES:
        dates = sorted(
            {p["date"] for p in lister_images_s1(km, f"{an}-07-15", f"{an}-11-01", orbite=eau.ORBITE_DEMO)}
        )
        surfaces = ee.List([_surface_km2(_eau(km, d), km) for d in dates]).getInfo()
        pluie = (
            ee.ImageCollection(config.EE_CHIRPS)
            .filterDate(f"{an}-07-01", f"{an}-10-01")
            .sum()
            .reduceRegion(ee.Reducer.mean(), km, 5000)
            .get("precipitation")
            .getInfo()
        )
        tri = sorted(surfaces)
        i_max = surfaces.index(max(surfaces))
        lignes.append(
            ligne_markdown(
                [
                    str(an),
                    str(len(dates)),
                    f"{max(surfaces):.2f}",
                    dates[i_max],
                    f"{tri[len(tri) // 2]:.2f}",
                    f"{pluie:.0f}",
                ]
            )
        )
        print(an, "fait")
    return "\n".join(lignes)


def sensibilite() -> str:
    import ee

    km = _km(None)
    blocs = []
    # Taille minimale des taches (seuil Otsu, baisse 3 dB)
    valeurs = ee.Dictionary(
        {
            f"{j}|{t}": _surface_km2(_eau(km, j, taille_px=t), km)
            for j in DATES_SENSIBILITE
            for t in TAILLES_PX
        }
    ).getInfo()
    lignes = [
        ligne_markdown(["Image", "≥ 0,05 ha", "≥ 0,1 ha (retenu)", "≥ 0,2 ha"]),
        ligne_markdown(["---"] * 4),
    ]
    for j in DATES_SENSIBILITE:
        lignes.append(ligne_markdown([j] + [f"{valeurs[f'{j}|{t}']:.2f}" for t in TAILLES_PX]))
    blocs.append(
        "**Taille minimale des taches** (eau nouvelle en km², seuil d'Otsu, baisse 3 dB)\n\n"
        + "\n".join(lignes)
    )
    # Seuil et baisse minimale (taches ≥ 0,1 ha)
    for j in ("2020-10-06", "2026-10-12"):
        valeurs = ee.Dictionary(
            {
                f"{s}|{b}": _surface_km2(_eau(km, j, seuil=s, baisse=b), km)
                for s in SEUILS_DB
                for b in BAISSES_DB
            }
        ).getInfo()
        lignes = [
            ligne_markdown(["Seuil VV", "baisse ≥ 2 dB", "≥ 3 dB (retenu)", "≥ 4 dB"]),
            ligne_markdown(["---"] * 4),
        ]
        for s in SEUILS_DB:
            nom = "Otsu borné (retenu)" if s is None else f"{s:.0f} dB"
            lignes.append(ligne_markdown([nom] + [f"{valeurs[f'{s}|{b}']:.2f}" for b in BAISSES_DB]))
        blocs.append(
            f"**Seuil et baisse minimale, image du {j}** (eau nouvelle en km², taches ≥ 0,1 ha)\n\n"
            + "\n".join(lignes)
        )
        print("sensibilité", j, "faite")
    return "\n\n".join(blocs)


def sequence_2026() -> None:
    """Trois cartes côte à côte : eau nouvelle le 6, le 12 et le 18 octobre 2026 sur fond Sentinel-2 du 13."""
    import ee
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    km = _km(None)
    lon0, lat0, lon1, lat1 = -17.35, 14.745, -17.255, 14.815
    region = ee.Geometry.Rectangle([lon0, lat0, lon1, lat1])
    fond = (
        ee.ImageCollection(config.EE_S2)
        .filterBounds(region)
        .filterDate("2026-10-13", "2026-10-14")
        .mosaic()
        .visualize(bands=["B4", "B3", "B2"], min=0, max=2500)
    )
    jours = [
        ("2026-10-06", "6 oct. : 2 j après les 76 mm du 4"),
        ("2026-10-12", "12 oct. : 4 j après les pluies du 7-8"),
        ("2026-10-18", "18 oct. : 10 j après"),
    ]
    fig, axes = plt.subplots(1, 3, figsize=(18, 5.6), dpi=130)
    for ax, (jour, titre) in zip(axes, jours, strict=True):
        e = _eau(km, jour)
        km2 = _surface_km2(e, km).getInfo()
        url = fond.blend(e.visualize(palette=["2E90FA"])).getThumbURL(
            {"region": region, "dimensions": 1100, "format": "png", "crs": "EPSG:4326"}
        )
        png = _sortie() / f"_fond_{jour}.png"
        urllib.request.urlretrieve(url, png)
        ax.imshow(plt.imread(png), extent=[lon0, lon1, lat0, lat1], aspect=1 / math.cos(math.radians(14.78)))
        ax.set_title(f"{titre}\neau nouvelle : {km2:.2f} km²", fontsize=10)
        ax.set_xticks([])
        ax.set_yticks([])
        png.unlink()
    fig.suptitle(
        "Keur Massar, octobre 2026 : eau nouvelle détectée par Sentinel-1 (bleu, taches ≥ 0,1 ha)",
        fontsize=12,
    )
    fig.text(
        0.01,
        0.01,
        "Fond : Sentinel-2 du 13 octobre 2026. Orbite 133 ascendante ; référence sèche février-mai 2026. "
        "Contient des données Copernicus Sentinel modifiées.",
        fontsize=8,
    )
    fig.savefig(_sortie() / "sequence_octobre_2026.png", bbox_inches="tight")
    plt.close(fig)
    print("carte : sequence_octobre_2026.png")


def main() -> None:
    import ee

    ee.Initialize(project=config.lire_env("EE_PROJECT"))
    sequence_2026()
    texte = "## Série 2020-2026 (Keur Massar, orbite 133)\n\n" + serie()
    texte += "\n\n## Analyse de sensibilité\n\n" + sensibilite() + "\n"
    (_sortie() / "series_et_sensibilite.md").write_text(texte, encoding="utf-8")
    print(texte)


if __name__ == "__main__":
    main()
