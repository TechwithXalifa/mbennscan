# firmware/ — balise de niveau d'eau (Aboubacry)

ESP32 + capteur à ultrasons étanche (JSN-SR04T ou A02YYUW), PlatformIO, framework Arduino.

## Démarrer

```bash
pip install platformio
cd firmware
cp include/secrets.example.h include/secrets.h   # remplir Wi-Fi, URL, clé, id
pio run -e jsn_sr04t -t upload && pio device monitor   # ou -e a02yyuw selon le capteur
```

Un environnement par capteur (`platformio.ini`) : `jsn_sr04t` (broches TRIG 25 / ECHO 26, ECHO en 5 V → pont diviseur 1 kΩ / 2 kΩ) et `a02yyuw` (UART, RX 16 / TX 17). Compiler sans flasher : `pio run -e jsn_sr04t`.

Limites connues : la tension de batterie n'est pas envoyée (`batterie_v` absent) et `rssi` part à `null` quand le Wi-Fi est coupé ; l'écran balise doit gérer ces absences.

## Comportement attendu

- Toutes les `MESURE_INTERVALLE_MS` : 5 lectures, médiane, rejet hors 20 à 600 cm.
- POST JSON conforme à `contracts/schemas/mesure_entrante.schema.json` vers l'Edge Function `mesure`, en HTTPS. Chaque mesure porte `age_s` (secondes depuis la lecture, via `millis()`) : après une coupure Wi-Fi, la file est vidée dans l'ordre et chaque mesure garde sa vraie date. Au-delà de 24 h, une mesure est abandonnée.
- Si l'envoi échoue : jusqu'à 50 mesures en mémoire, renvoi avec attente croissante.
- LED : lente = OK, rapide = erreur réseau.

## Démo

- Étalonner : distance à vide capteur - fond du bac = `hauteur_capteur_cm` (table `balises`).
- Vérifier 3 niveaux à la règle (écart ≤ 1 cm), 30 minutes sans redémarrage.
- Enregistrer une vidéo de secours de 30 secondes.

Détails : cahier des charges, section 8.
