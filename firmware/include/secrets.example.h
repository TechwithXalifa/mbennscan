// Copier ce fichier en secrets.h (jamais versionné) et remplir les valeurs.
#pragma once

#define WIFI_SSID          ""
#define WIFI_PASSWORD      ""

// URL de l'Edge Function : https://<projet>.supabase.co/functions/v1/mesure
#define MESURE_URL         ""
// Clé propre à cette balise (stockée hachée côté Supabase)
#define BALISE_API_KEY     ""
#define BALISE_ID          "bal-01"

// Intervalle entre deux mesures, en millisecondes (5000 en démo, 60000 sur le terrain)
#define MESURE_INTERVALLE_MS 5000
