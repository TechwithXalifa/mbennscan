# firmware/ — balise de niveau d'eau (Aboubacry)

ESP32 + capteur à ultrasons étanche (JSN-SR04T ou A02YYUW), PlatformIO, framework Arduino.

## Démarrer

```bash
pip install platformio
cd firmware
pio project init --board esp32dev
cp include/secrets.example.h include/secrets.h   # remplir Wi-Fi, URL, clé, id
pio run -t upload && pio device monitor
```

## Comportement attendu

- Toutes les `MESURE_INTERVALLE_MS` : 5 lectures, médiane, rejet hors 20 à 600 cm.
- POST JSON conforme à `contracts/schemas/mesure_entrante.schema.json` vers l'Edge Function `mesure`, en HTTPS.
- Si l'envoi échoue : jusqu'à 50 mesures en mémoire, renvoi avec attente croissante.
- LED : lente = OK, rapide = erreur réseau.

## Démo

- Étalonner : distance à vide capteur - fond du bac = `hauteur_capteur_cm` (table `balises`).
- Vérifier 3 niveaux à la règle (écart ≤ 1 cm), 30 minutes sans redémarrage.
- Enregistrer une vidéo de secours de 30 secondes.

Détails : cahier des charges, section 8.
