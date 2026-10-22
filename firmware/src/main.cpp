// MbënnScan — firmware de la balise de niveau d'eau (ESP32, Arduino)
//
// Toutes les MESURE_INTERVALLE_MS :
//   1. 5 lectures du capteur, rejet hors 20–600 cm, médiane (≥ 3 lectures valides requises)
//   2. mesure empilée dans une file de 50 éléments (la plus ancienne est écrasée si pleine)
//   3. envoi de la file en HTTPS vers l'Edge Function `mesure`, une mesure par seconde au plus
//      (le serveur répond 429 au-delà), avec attente croissante en cas d'échec
//   Chaque mesure part avec `age_s` : secondes écoulées depuis la lecture (millis(), pas besoin
//   d'horloge réseau). Le serveur la date « réception - age_s » : après une coupure Wi-Fi, la file
//   est vidée dans l'ordre et chaque mesure garde sa vraie date, sans en perdre aucune.
// LED : lente = OK, rapide = erreur réseau.
//
// [TEST] Bouton « Coupure » (GPIO 4) : simule une absence de réseau sans toucher au Wi-Fi.
//   1er appui = coupure (les mesures continuent et s'accumulent dans la file, rien n'est envoyé)
//   2e appui  = réseau rétabli (la file est vidée dans l'ordre, avec les bons age_s)
//
// Contrat : contracts/schemas/mesure_entrante.schema.json

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <math.h>

#include "secrets.h"

// ── Broches (modifiables) ────────────────────────────────────────────────────
#define PIN_LED   2     // LED bleue intégrée de la plupart des ESP32 DevKit
#define PIN_BTN_COUPURE 4   // [TEST] bouton vers GND (INPUT_PULLUP) : simule une coupure réseau
#if defined(CAPTEUR_TRIG_ECHO)
  #define PIN_TRIG 25
  #define PIN_ECHO 26   // ATTENTION : si le capteur est alimenté en 5 V, ECHO sort en 5 V
                        // → pont diviseur (1 kΩ / 2 kΩ) avant l'ESP32, ou alimenter en 3,3 V.
#elif defined(CAPTEUR_UART)
  #define PIN_RX2 16    // ← sortie TX du capteur
  #define PIN_TX2 17    // → entrée RX du capteur (souvent inutilisée)
#else
  #error "Choisir un environnement PlatformIO : jsn_sr04t ou a02yyuw"
#endif

// [MODIF] Canal Wi-Fi : 6 = canal de Wokwi-GUEST (connexion bien plus rapide).
// Sur le vrai matériel, mettre 0 dans secrets.h (= recherche automatique).
#ifndef WIFI_CHANNEL
  #define WIFI_CHANNEL 6
#endif

// ── Paramètres de mesure ─────────────────────────────────────────────────────
static const uint8_t  NB_LECTURES    = 5;
static const uint8_t  NB_VALIDES_MIN = 3;
static const float    DIST_MIN_CM    = 20.0f;
static const float    DIST_MAX_CM    = 600.0f;
static const uint32_t PAUSE_LECTURE_MS = 80;
static const uint32_t AGE_MAX_S    = 86400;  // limite du contrat (age_s ≤ 86400) ; au-delà, mesure abandonnée
static const int      RSSI_INCONNU = 1;   // hors plage (-120…0) : pas de mesure → envoyé en null
static const int      PAS_DE_WIFI  = -100; // [MODIF] code interne : Wi-Fi pas connecté, rien envoyé

// ── File d'attente ───────────────────────────────────────────────────────────
static const size_t FILE_MAX = 50;
struct Mesure { float distance_cm; int rssi; uint32_t t_ms; };   // t_ms : millis() à la lecture
static Mesure  file[FILE_MAX];
static size_t  fileTete = 0, fileTaille = 0;

static void empiler(const Mesure &m) {
  if (fileTaille == FILE_MAX) {              // pleine : on perd la plus ancienne
    fileTete = (fileTete + 1) % FILE_MAX;
    fileTaille--;
  }
  file[(fileTete + fileTaille) % FILE_MAX] = m;
  fileTaille++;
}
static void depiler() {
  if (fileTaille == 0) return;
  fileTete = (fileTete + 1) % FILE_MAX;
  fileTaille--;
}

// ── État ─────────────────────────────────────────────────────────────────────
static uint32_t prochaineMesure = 0;
static uint32_t prochainEnvoi   = 0;
static uint32_t attenteMs       = 1000;      // attente croissante : 1 s → 60 s
static bool     echecEnvoi      = false;
static uint32_t dernierWifi     = 0;
static bool     wifiOk          = false;     // [MODIF] état Wi-Fi au tour précédent
static bool     reseauCoupe     = false;     // [TEST] true = coupure réseau simulée par le bouton

// ── Capteur ──────────────────────────────────────────────────────────────────
#if defined(CAPTEUR_TRIG_ECHO)

static float lireUneDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);  delayMicroseconds(4);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(12);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long us = pulseIn(PIN_ECHO, HIGH, 38000UL);   // 38 ms ≈ 650 cm aller-retour
  if (us == 0) return NAN;
  return us * 0.0343f / 2.0f;                            // 343 m/s à ~20 °C
}

#else  // CAPTEUR_UART (A02YYUW) : trame 0xFF, H, L, somme ; distance en mm

static float lireUneDistanceCm() {
  while (Serial2.available()) Serial2.read();            // on repart d'une trame fraîche
  uint32_t debut = millis();
  while (millis() - debut < 300) {
    if (Serial2.available() >= 4) {
      if (Serial2.peek() != 0xFF) { Serial2.read(); continue; }
      uint8_t t[4];
      Serial2.readBytes(t, 4);
      if (((t[0] + t[1] + t[2]) & 0xFF) != t[3]) continue;
      return ((t[1] << 8) | t[2]) / 10.0f;
    }
    delay(2);
  }
  return NAN;
}

#endif

// Médiane de NB_LECTURES lectures, ou NAN si trop peu de lectures valides.
static float mesurerMediane() {
  float v[NB_LECTURES];
  uint8_t n = 0;
  for (uint8_t i = 0; i < NB_LECTURES; i++) {
    float d = lireUneDistanceCm();
    if (!isnan(d) && d >= DIST_MIN_CM && d <= DIST_MAX_CM) v[n++] = d;
    delay(PAUSE_LECTURE_MS);
  }
  if (n < NB_VALIDES_MIN) return NAN;
  for (uint8_t i = 1; i < n; i++) {                      // tri par insertion
    float x = v[i]; int j = i - 1;
    while (j >= 0 && v[j] > x) { v[j + 1] = v[j]; j--; }
    v[j + 1] = x;
  }
  return (n % 2) ? v[n / 2] : (v[n / 2 - 1] + v[n / 2]) / 2.0f;
}

// ── [TEST] Bouton de coupure réseau simulée ─────────────────────────────────
// Anti-rebond : l'état n'est pris en compte que s'il est stable depuis 50 ms.
static void gererBoutonCoupure(uint32_t now) {
  static bool     etatStable  = HIGH;   // INPUT_PULLUP : HIGH = relâché, LOW = appuyé
  static bool     dernierLu   = HIGH;
  static uint32_t tChangement = 0;

  bool lu = digitalRead(PIN_BTN_COUPURE);
  if (lu != dernierLu) { dernierLu = lu; tChangement = now; }

  if ((now - tChangement) > 50 && lu != etatStable) {
    etatStable = lu;
    if (etatStable == LOW) {            // front descendant = un appui
      reseauCoupe = !reseauCoupe;
      if (reseauCoupe) {
        Serial.println("[test] >>> COUPURE RESEAU simulee : les mesures s'accumulent en file");
      } else {
        Serial.printf("[test] >>> reseau retabli : %u mesure(s) a envoyer\n", (unsigned)fileTaille);
        attenteMs = 1000;               // on repart tout de suite, sans attente résiduelle
        prochainEnvoi = now;
        echecEnvoi = false;
      }
    }
  }
}

// ── Réseau ───────────────────────────────────────────────────────────────────
static void connecterWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);    // [MODIF] canal explicite
  dernierWifi = millis();
}

// Renvoie le code HTTP (201, 400, 401, 429…), un code négatif de HTTPClient si la requête
// n'a pas abouti, ou PAS_DE_WIFI si rien n'a été tenté.
static int envoyer(const Mesure &m) {
  if (WiFi.status() != WL_CONNECTED) return PAS_DE_WIFI; // [MODIF] distinct d'un échec HTTP

  char rssiTxt[8];
  if (m.rssi == RSSI_INCONNU) strcpy(rssiTxt, "null");
  else snprintf(rssiTxt, sizeof rssiTxt, "%d", m.rssi);

  char corps[160];
  uint32_t age_s = (millis() - m.t_ms) / 1000;           // soustraction non signée : sûre au débordement de millis()
  snprintf(corps, sizeof corps,
           "{\"balise_id\":\"%s\",\"distance_cm\":%.1f,\"rssi\":%s,\"age_s\":%lu}",
           BALISE_ID, m.distance_cm, rssiTxt, (unsigned long)age_s);

  // [MODIF] Client TLS conservé entre les envois : on évite un handshake complet à chaque mesure
  // (c'est lui qui provoque les « connection refused » sur la passerelle simulée de Wokwi).
  static WiFiClientSecure client;
  client.setInsecure();   // TODO(sécurité) : épingler le certificat racine avant la mise en service terrain
  HTTPClient http;
  http.setReuse(true);
  http.setTimeout(8000);
  if (!http.begin(client, MESURE_URL)) {
    Serial.println("[envoi] MESURE_URL invalide (vérifier secrets.h)");  // [MODIF]
    return -1;
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + BALISE_API_KEY);
  int code = http.POST((uint8_t *)corps, strlen(corps));
  if (code < 0) {                                        // [MODIF] cause lisible de l'échec
    Serial.printf("[envoi] HTTPS : %s\n", http.errorToString(code).c_str());
    client.stop();                                       // [MODIF] connexion douteuse : on repart d'une session neuve
  } else if (code != 201) {
    Serial.println(http.getString());                    // ex. {"erreur":"..."}
  }
  http.end();
  return code;
}

static void traiterFile() {
  if (fileTaille == 0 || (int32_t)(millis() - prochainEnvoi) < 0) return;

  // [TEST] Coupure simulée : rien n'est envoyé, la file continue de grossir.
  if (reseauCoupe) return;

  // [MODIF] Pas de Wi-Fi : on attend sans faire grimper l'attente ; l'envoi repart
  // tout seul dès la reconnexion (voir loop()).
  if (WiFi.status() != WL_CONNECTED) return;

  const Mesure &m = file[fileTete];
  if ((millis() - m.t_ms) / 1000 > AGE_MAX_S) {          // trop ancienne pour le contrat : 400 assuré
    Serial.println("[file] mesure de plus de 24 h abandonnée");
    depiler();
    return;
  }
  int code = envoyer(m);

  if (code == 201) {
    Serial.printf("[envoi] 201 OK  %.1f cm, age %lu s (reste %u)\n", m.distance_cm,
                  (unsigned long)((millis() - m.t_ms) / 1000), (unsigned)(fileTaille - 1));
    depiler();
    echecEnvoi = false;
    attenteMs = 1000;
    prochainEnvoi = millis() + 1100;                     // > 1 s : limite du serveur
  } else if (code == 400) {                              // mesure refusée : inutile de réessayer
    Serial.println("[envoi] 400 mesure refusée, abandonnée");
    depiler();
    prochainEnvoi = millis() + 1100;
  } else if (code == 429) {
    Serial.println("[envoi] 429 trop rapide, on patiente");
    prochainEnvoi = millis() + 2000;
  } else {                                               // 401, 5xx, échec HTTPS…
    if (code == 401) Serial.println("[envoi] 401 clé de balise invalide (vérifier secrets.h)");
    else Serial.printf("[envoi] échec (%d), nouvel essai dans %lu s\n", code, (unsigned long)(attenteMs / 1000));
    echecEnvoi = true;
    prochainEnvoi = millis() + attenteMs;
    attenteMs = min<uint32_t>(attenteMs * 2, 60000);
  }
}

static void majLed() {
  // [TEST] la coupure simulée allume le même signal qu'une vraie erreur réseau
  bool erreur = reseauCoupe || echecEnvoi || WiFi.status() != WL_CONNECTED;
  uint32_t demiPeriode = erreur ? 100 : 1000;            // rapide = erreur, lente = OK
  digitalWrite(PIN_LED, (millis() / demiPeriode) % 2);
}

// ── Arduino ──────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BTN_COUPURE, INPUT_PULLUP);                // [TEST]
#if defined(CAPTEUR_TRIG_ECHO)
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
#else
  Serial2.begin(9600, SERIAL_8N1, PIN_RX2, PIN_TX2);
#endif
  Serial.printf("\nMbënnScan balise %s — intervalle %d ms\n", BALISE_ID, MESURE_INTERVALLE_MS);
  connecterWifi();

  // [MODIF] On attend le Wi-Fi (15 s max) avant la première mesure,
  // pour que le premier envoi parte tout de suite.
  Serial.printf("[wifi] connexion à %s", WIFI_SSID);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(250);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " OK" : " pas encore, on continue");
}

void loop() {
  uint32_t now = millis();
  static int bpAvant = -1;
  int bpEtat = digitalRead(PIN_BTN_COUPURE);
  if (bpEtat != bpAvant) { bpAvant = bpEtat; Serial.printf("[bp] etat=%d\n", bpEtat); }

  gererBoutonCoupure(now);                               // [TEST]

  // [MODIF] Le Wi-Fi vient de (re)venir : on remet l'attente à zéro et on vide la file tout de suite
  bool connecte = WiFi.status() == WL_CONNECTED;
  if (connecte && !wifiOk) {
    Serial.printf("[wifi] connecté, IP %s, rssi %d\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    attenteMs = 1000;
    prochainEnvoi = now;
    echecEnvoi = false;
  } else if (!connecte && wifiOk) {
    Serial.println("[wifi] coupé, les mesures sont gardées en file");
  }
  wifiOk = connecte;

  // L'auto-reconnexion gère les coupures ; si le Wi-Fi reste coupé 30 s, on relance
  if (!connecte && now - dernierWifi > 30000) {
    Serial.println("[wifi] toujours coupé, nouvelle tentative…");
    WiFi.reconnect();
    dernierWifi = now;
  }

  if ((int32_t)(now - prochaineMesure) >= 0) {
    prochaineMesure = now + MESURE_INTERVALLE_MS;
    float d = mesurerMediane();
    if (isnan(d)) {
      Serial.println("[mesure] lecture invalide (hors 20–600 cm ou capteur muet), ignorée");
    } else {
      // [TEST] pendant la coupure simulée, pas de RSSI (comme sans réseau)
      bool reseauOk = !reseauCoupe && WiFi.status() == WL_CONNECTED;
      Mesure m = { d, reseauOk ? WiFi.RSSI() : RSSI_INCONNU, millis() };
      empiler(m);

      if (reseauCoupe) {
        Serial.printf("[file] pas de reseau : %.1f cm stockee en memoire (file %u)\n",
                      m.distance_cm, (unsigned)fileTaille);
      } else {
        Serial.printf("[mesure] %.1f cm, rssi %d, file %u\n",
                      m.distance_cm, m.rssi, (unsigned)fileTaille);
      }
    }
  } 

  traiterFile();
  majLed();
  delay(5);
}
