"""Génère les fichiers du logo MbënnScan (SVG, PNG, favicon, icônes d'app).

Pictogramme : une goutte faite de pixels d'image satellite ; les pixels pleins du bas sont l'eau détectée.
Logotype : Inter Semibold, « Mbënn » en encre, « Scan » en bleu primaire.

Usage : pip install fonttools cairosvg pillow && python web/scripts/generer-logo.py [chemin/Inter-SemiBold.otf]
"""

import io
import math
import sys
from pathlib import Path

import cairosvg
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image

ENCRE, PRIMAIRE, CLAIR, BLANC = "#101828", "#0E5A8A", "#7FA9C6", "#FFFFFF"
POLICE = sys.argv[1] if len(sys.argv) > 1 else "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
WEB = Path(__file__).resolve().parents[1]
BRAND, APP = WEB / "public" / "brand", WEB / "src" / "app"


# Demi-largeur de chaque rangée de pixels (en cases, autour de la colonne centrale) et rangée où commence l'eau.
GOUTTES = {
    "normal": ([0, 0, 1, 1, 2, 2, 3, 4, 5, 5, 5, 4, 3], 7),
    "petit": ([0, 1, 1, 2, 2, 2, 1], 4),
}


def picto(couleur, sec=None, taille="normal"):
    """Pictogramme 64x64 : une goutte faite de pixels d'image satellite.

    Les pixels du bas, pleins, sont l'eau détectée ; ceux du haut, plus petits, le reste de l'image.
    sec : couleur des pixels du haut (par défaut la même, pour les versions monochromes).
    """
    rangees, eau = GOUTTES[taille]
    n = len(rangees)
    petit = taille == "petit"
    c = 8 if petit else 60 / n  # en petit, cases de 2 px pile à 16 px, sans espace
    haut = (64 - n * c) / 2
    rects = []
    for r, demi in enumerate(rangees):
        for k in range(-demi, demi + 1):
            mouille = r >= eau
            m = 0 if petit else c * (0.08 if mouille else 0.17)
            x, y = 32 + (k - 0.5) * c + m, haut + r * c + m
            fill = "" if mouille or not sec else f' fill="{sec}"'
            rects.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{c - 2 * m:.2f}" height="{c - 2 * m:.2f}" rx="{0 if petit else c * 0.18:.2f}"{fill}/>')
    return f'<g fill="{couleur}">{"".join(rects)}</g>'


def texte(police, mot, x, base, taille):
    """Contours des glyphes d'Inter, pour que le SVG ne dépende d'aucune police installée."""
    gs, cmap, hmtx = police.getGlyphSet(), police.getBestCmap(), police["hmtx"]
    e = taille / police["head"].unitsPerEm
    pen = SVGPathPen(gs, lambda v: f"{v:.1f}")
    for c in mot:
        nom = cmap[ord(c)]
        gs[nom].draw(TransformPen(pen, (e, 0, 0, -e, x, base)))
        x += hmtx[nom][0] * e
    return pen.getCommands(), x


def logo(police, mbenn, scan, pic):
    taille, base = 40, 46
    d1, x = texte(police, "Mbënn", 78, base, taille)
    d2, x = texte(police, "Scan", x, base, taille)
    w = math.ceil(x + 2)
    corps = f'{pic}<path d="{d1}" fill="{mbenn}"/><path d="{d2}" fill="{scan}"/>'
    return svg(corps, w, 64)


def svg(corps, w=64, h=64):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{corps}</svg>\n'


def png(src, chemin, largeur):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(bytestring=src.encode(), write_to=str(chemin), output_width=largeur)


def main():
    police = TTFont(POLICE)
    pictos = {
        "couleur": picto(PRIMAIRE, CLAIR),
        "noir": picto(ENCRE),
        "blanc": picto(BLANC),
    }
    logos = {
        "couleur": logo(police, ENCRE, PRIMAIRE, pictos["couleur"]),
        "noir": logo(police, ENCRE, ENCRE, pictos["noir"]),
        "blanc": logo(police, BLANC, BLANC, pictos["blanc"]),
    }
    BRAND.mkdir(parents=True, exist_ok=True)
    for nom, corps in pictos.items():
        src = svg(corps)
        (BRAND / f"pictogramme-{nom}.svg").write_text(src)
        for t in (64, 128, 256, 512, 1024):
            png(src, BRAND / "png" / f"pictogramme-{nom}-{t}.png", t)
    for nom, src in logos.items():
        (BRAND / f"logo-{nom}.svg").write_text(src)
        for h in (64, 128, 256):
            w = int(src.split('width="')[1].split('"')[0])
            png(src, BRAND / "png" / f"logo-{nom}-{h}.png", w * h // 64)

    # Petites tailles : moins de pixels, calés sur la grille de 16 px.
    favicon = svg(picto(PRIMAIRE, CLAIR, taille="petit"))
    (APP / "icon.svg").write_text(favicon)
    images = [Image.open(io.BytesIO(cairosvg.svg2png(bytestring=favicon.encode(), output_width=t))) for t in (16, 32, 48)]
    images[-1].save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=images[:-1])

    # Icônes d'app : pictogramme blanc sur carré primaire, avec marge (zone sûre des icônes masquables).
    def icone(marge):
        s = 64 * (1 - 2 * marge)
        return svg(f'<rect width="64" height="64" fill="{PRIMAIRE}"/><g transform="translate({64 * marge} {64 * marge}) scale({s / 64})">{picto(BLANC)}</g>')

    png(icone(0.14), APP / "apple-icon.png", 180)
    png(icone(0.14), BRAND / "icone-192.png", 192)
    png(icone(0.14), BRAND / "icone-512.png", 512)
    png(icone(0.2), BRAND / "icone-masquable-512.png", 512)


if __name__ == "__main__":
    main()
