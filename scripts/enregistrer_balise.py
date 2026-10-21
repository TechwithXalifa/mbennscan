"""Enregistre une balise : génère sa clé d'API et le SQL qui stocke son hachage.

La clé n'est affichée qu'une fois et n'est jamais écrite sur le disque. Seul son
hachage SHA-256 (hex) va dans balises.cle_api_hash, comme l'attend l'Edge Function
mesure. Le SQL est à coller dans le SQL Editor de Supabase ; relancer le script
pour une balise existante remplace sa clé.

Exemple :
    python scripts/enregistrer_balise.py --id bal-01 --nom "Bac de démonstration" \
        --lon -17.315 --lat 14.78 --hauteur 80 --seuil 40
"""

import argparse
import hashlib
import re
import secrets
import sys


def sql_texte(valeur: str) -> str:
    return "'" + valeur.replace("'", "''") + "'"


def arguments(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Enregistre une balise et génère sa clé d'API.")
    p.add_argument("--id", required=True, help="identifiant bal-NN, ex. bal-01")
    p.add_argument("--nom", required=True, help="nom affiché sur l'écran Balise")
    p.add_argument("--lon", type=float, required=True, help="longitude WGS84")
    p.add_argument("--lat", type=float, required=True, help="latitude WGS84")
    p.add_argument("--hauteur", type=float, required=True, help="distance capteur - fond du bac à vide (cm)")
    p.add_argument("--seuil", type=float, default=None, help="niveau d'alerte (cm), facultatif")
    a = p.parse_args(argv)

    # Mêmes bornes que contracts/schemas/balises.schema.json
    if not re.fullmatch(r"bal-[0-9]{2}", a.id):
        p.error("--id doit être de la forme bal-NN")
    if not a.nom.strip():
        p.error("--nom ne doit pas être vide")
    if not -180 <= a.lon <= 180 or not -90 <= a.lat <= 90:
        p.error("--lon ou --lat hors bornes")
    if a.hauteur <= 0:
        p.error("--hauteur doit être strictement positive")
    if a.seuil is not None and a.seuil < 0:
        p.error("--seuil doit être positif")
    return a


def sql_enregistrement(a: argparse.Namespace, cle_hash: str) -> str:
    seuil = "null" if a.seuil is None else repr(a.seuil)
    return (
        "insert into balises (id, nom, geom, hauteur_capteur_cm, seuil_alerte_cm, cle_api_hash)\n"
        f"values ({sql_texte(a.id)}, {sql_texte(a.nom.strip())}, "
        f"st_setsrid(st_makepoint({a.lon!r}, {a.lat!r}), 4326), {a.hauteur!r}, {seuil}, {sql_texte(cle_hash)})\n"
        "on conflict (id) do update set nom = excluded.nom, geom = excluded.geom,\n"
        "  hauteur_capteur_cm = excluded.hauteur_capteur_cm, seuil_alerte_cm = excluded.seuil_alerte_cm,\n"
        "  cle_api_hash = excluded.cle_api_hash;"
    )


def main(argv: list[str] | None = None) -> None:
    a = arguments(argv)
    cle = secrets.token_urlsafe(32)
    cle_hash = hashlib.sha256(cle.encode("utf-8")).hexdigest()

    print("1. Coller dans Supabase > SQL Editor > Run :\n")
    print(sql_enregistrement(a, cle_hash))
    print("\n2. Clé de la balise (affichée une seule fois, à transmettre en privé) :\n")
    print(f"   {cle}")
    print("\n   firmware/include/secrets.h :")
    print(f'   #define BALISE_API_KEY     "{cle}"')
    print(f'   #define BALISE_ID          "{a.id}"')
    print("\n3. Essai (doit répondre 201) :\n")
    print(
        '   curl -i -X POST "$SUPABASE_URL/functions/v1/mesure" '
        f'-H "Authorization: Bearer {cle}" -H "Content-Type: application/json" '
        f"-d '{{\"balise_id\": \"{a.id}\", \"distance_cm\": 50}}'"
    )


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main()
