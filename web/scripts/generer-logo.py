"""Génère les fichiers du logo MbënnScan (SVG, PNG, favicon, icônes d'app).

Pictogramme : un hexagone (rappel des mailles de calcul) contenant une vague d'eau.
Logotype : Inter Semibold, « Mbënn » en encre, « Scan » en bleu primaire (cahier des charges, section Identité).

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

ENCRE, PRIMAIRE, BLANC = "#101828", "#0E5A8A", "#FFFFFF"
POLICE = sys.argv[1] if len(sys.argv) > 1 else "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
WEB = Path(__file__).resolve().parents[1]
BRAND, APP = WEB / "public" / "brand", WEB / "src" / "app"


def hexagone(cx=32, cy=32, r=30, arrondi=4):
    """Hexagone pointe en haut, coins arrondis, en chemin SVG."""
    pts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(-90, 270, 60)]
    d = []
    for i, (x, y) in enumerate(pts):
        (px, py), (nx, ny) = pts[i - 1], pts[(i + 1) % 6]
        k = arrondi / r
        a = (x + (px - x) * k, y + (py - y) * k)
        b = (x + (nx - x) * k, y + (ny - y) * k)
        d.append(f"{'M' if i == 0 else 'L'}{a[0]:.2f} {a[1]:.2f}Q{x:.2f} {y:.2f} {b[0]:.2f} {b[1]:.2f}")
    return "".join(d) + "Z"


def vague(y, x0=16, x1=48, amp=2.8, ep=5, n=48):
    """Vague sur deux périodes, contournée en forme pleine (trait de largeur ep, bouts ronds)."""
    pts = []
    for i in range(n + 1):
        t = i / n
        a = 4 * math.pi * t
        dy = -amp * 4 * math.pi / (x1 - x0) * math.cos(a)  # pente dy/dx
        nx, ny = -dy / math.hypot(1, dy), 1 / math.hypot(1, dy)
        pts.append((x0 + (x1 - x0) * t, y - amp * math.sin(a), nx, ny))
    h = ep / 2
    haut = [f"{x + nx * -h:.2f} {yy + ny * -h:.2f}" for x, yy, nx, ny in pts]
    bas = [f"{x + nx * h:.2f} {yy + ny * h:.2f}" for x, yy, nx, ny in reversed(pts)]
    return f"M{haut[0]}L{'L'.join(haut[1:])}A{h} {h} 0 0 1 {bas[0]}L{'L'.join(bas[1:])}A{h} {h} 0 0 1 {haut[0]}Z"


VAGUES = {"normal": [vague(26), vague(38)], "petit": [vague(32, 13, 51, 4.5, 9)]}


def picto(couleur, vagues=BLANC, taille="normal", decoupe=False):
    """Pictogramme 64x64. decoupe=True : vagues évidées (monochrome, une seule couleur)."""
    v = "".join(VAGUES[taille])
    if decoupe:
        return f'<path d="{hexagone()}{v}" fill="{couleur}" fill-rule="evenodd"/>'
    return f'<path d="{hexagone()}" fill="{couleur}"/><path d="{v}" fill="{vagues}"/>'


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
        "couleur": picto(PRIMAIRE),
        "noir": picto(ENCRE, decoupe=True),
        "blanc": picto(BLANC, decoupe=True),
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

    # Petites tailles : une seule vague épaisse, monochrome primaire.
    favicon = svg(picto(PRIMAIRE, taille="petit", decoupe=True))
    (APP / "icon.svg").write_text(favicon)
    images = [Image.open(io.BytesIO(cairosvg.svg2png(bytestring=favicon.encode(), output_width=t))) for t in (16, 32, 48)]
    images[-1].save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=images[:-1])

    # Icônes d'app : pictogramme blanc sur carré primaire, avec marge (zone sûre des icônes masquables).
    def icone(marge):
        s = 64 * (1 - 2 * marge)
        return svg(f'<rect width="64" height="64" fill="{PRIMAIRE}"/><g transform="translate({64 * marge} {64 * marge}) scale({s / 64})">{picto(BLANC, decoupe=True)}</g>')

    png(icone(0.14), APP / "apple-icon.png", 180)
    png(icone(0.14), BRAND / "icone-192.png", 192)
    png(icone(0.14), BRAND / "icone-512.png", 512)
    png(icone(0.2), BRAND / "icone-masquable-512.png", 512)


if __name__ == "__main__":
    main()
