"""Inventaire des images Sentinel-1 et de la pluie autour d'un épisode (issue #9).

    python -m pipeline.inventaire                       # épisode imposé (4 octobre 2026)
    python -m pipeline.inventaire --date 2025-08-17     # autre épisode

Liste les images IW (VV + VH) qui couvrent Keur Massar, leur orbite relative et leur couverture,
la référence sèche disponible sur la même orbite, et la pluie journalière GPM IMERG.
"""

from __future__ import annotations

import argparse
from datetime import date, timedelta

from pipeline import config

# Emprise approximative du département de Keur Massar, en attendant les limites COD-AB (#10).
KEUR_MASSAR_BBOX = [-17.345, 14.745, -17.255, 14.815]


def image_vers_run_meta(p: dict) -> dict:
    """Propriétés d'une image S1 (Earth Engine) → entrée `images` de run_meta.json."""
    return {
        "id": p["system:index"],
        "date": p["date"],
        "orbite_relative": int(p["relativeOrbitNumber_start"]),
        "satellite": "S1" + p["platform_number"],
    }


def lister_images_s1(geom, debut: str, fin: str, orbite: int | None = None) -> list[dict]:
    """Images S1 IW VV+VH qui touchent `geom`, avec heure, passe et part de `geom` couverte."""
    import ee

    c = (
        ee.ImageCollection(config.EE_S1)
        .filterBounds(geom)
        .filterDate(debut, fin)
        .filter(ee.Filter.eq("instrumentMode", "IW"))
        .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VH"))
    )
    if orbite is not None:
        c = c.filter(ee.Filter.eq("relativeOrbitNumber_start", orbite))

    def proprietes(im):
        couverture = im.geometry().intersection(geom, 10).area(10).divide(geom.area(10))
        return ee.Feature(
            None,
            {
                "system:index": im.get("system:index"),
                "date": im.date().format("YYYY-MM-dd"),
                "heure": im.date().format("HH:mm"),
                "relativeOrbitNumber_start": im.get("relativeOrbitNumber_start"),
                "orbitProperties_pass": im.get("orbitProperties_pass"),
                "platform_number": im.get("platform_number"),
                "couverture": couverture,
            },
        )

    feats = c.map(proprietes).sort("date").getInfo()["features"]
    return [f["properties"] for f in feats]


def pluie_journaliere(geom, debut: date, fin: date) -> list[tuple[date, float | None]]:
    """Cumul journalier moyen (mm) sur `geom` d'après GPM IMERG (pas de 30 min, en mm/h)."""
    import ee

    gpm = ee.ImageCollection(config.EE_GPM).select("precipitation")
    jours = [debut + timedelta(days=i) for i in range((fin - debut).days + 1)]

    def cumul(d):
        d = ee.Date(d)
        jour = gpm.filterDate(d, d.advance(1, "day"))
        moyenne = jour.sum().multiply(0.5).reduceRegion(ee.Reducer.mean(), geom, 10000).get("precipitation")
        return ee.Algorithms.If(jour.size().gt(0), moyenne, None)  # None : pas encore publié

    valeurs = ee.List([cumul(j.isoformat()) for j in jours]).getInfo()
    return list(zip(jours, valeurs, strict=True))


def main(argv: list[str] | None = None) -> None:
    import ee

    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--date", type=date.fromisoformat, default=config.DATE_EVENEMENT_IMPOSE)
    ap.add_argument("--jours-avant", type=int, default=12)
    ap.add_argument("--jours-apres", type=int, default=16)
    args = ap.parse_args(argv)

    ee.Initialize(project=config.lire_env("EE_PROJECT"))
    km = ee.Geometry.Rectangle(KEUR_MASSAR_BBOX)
    debut, fin = args.date - timedelta(days=args.jours_avant), args.date + timedelta(days=args.jours_apres)

    print(f"Images Sentinel-1 IW sur Keur Massar du {debut} au {fin}")
    orbites = set()
    for p in lister_images_s1(km, debut.isoformat(), (fin + timedelta(days=1)).isoformat()):
        orbites.add(p["relativeOrbitNumber_start"])
        print(
            f"  {p['date']} {p['heure']}  orbite {p['relativeOrbitNumber_start']:>3} "
            f"{p['orbitProperties_pass']:<10} S1{p['platform_number']}  couverture {p['couverture']:.0%}"
        )

    an = args.date.year
    mois = config.MOIS_REFERENCE_SECHE
    for o in sorted(orbites):
        ref = lister_images_s1(km, f"{an}-{mois[0]:02d}-01", f"{an}-{mois[-1] + 1:02d}-01", orbite=o)
        # Une même date peut compter plusieurs tranches contiguës de la même orbite.
        print(f"Référence sèche {an}, orbite {o} : {len({p['date'] for p in ref})} date(s)")

    print("Pluie journalière GPM IMERG (moyenne sur Keur Massar, données provisoires si récentes)")
    for j, mm in pluie_journaliere(km, debut, fin):
        alerte = "  ≥ seuil" if mm is not None and mm >= config.PARAMETRES.seuil_pluie_mm else ""
        print(f"  {j}  {'-' if mm is None else f'{mm:5.1f} mm'}{alerte}")


if __name__ == "__main__":
    main()
