// MbënnScan — firmware de la balise de niveau d'eau (ESP32, Arduino)
//
// Toutes les MESURE_INTERVALLE_MS :
//   1. 5 lectures du capteur, rejet hors 20–600 cm, médiane (≥ 3 lectures valides requises)
//   2. mesure empilée dans une file de 50 éléments (la plus ancienne est écrasée si pleine)
//   3. envoi de la file en HTTPS vers l'Edge Function `mesure`, une mesure par seconde au plus
//      (le serveur répond 429 au-delà), avec attente croissante en cas d'échec
// LED : lente = OK, rapide = erreur réseau.
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

// ── Paramètres de mesure ─────────────────────────────────────────────────────
static const uint8_t  NB_LECTURES    = 5;
static const uint8_t  NB_VALIDES_MIN = 3;
static const float    DIST_MIN_CM    = 20.0f;
static const float    DIST_MAX_CM    = 600.0f;
static const uint32_t PAUSE_LECTURE_MS = 80;

// ── File d'attente ───────────────────────────────────────────────────────────
static const size_t FILE_MAX = 50;
struct Mesure { float distance_cm; int rssi; };
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

// ── Réseau ───────────────────────────────────────────────────────────────────
static void connecterWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  dernierWifi = millis();
}

// Renvoie le code HTTP (201, 400, 401, 429…) ou -1 si la requête n'a pas abouti.
static int envoyer(const Mesure &m) {
  if (WiFi.status() != WL_CONNECTED) return -1;

  char corps[128];
  snprintf(corps, sizeof corps,
           "{\"balise_id\":\"%s\",\"distance_cm\":%.1f,\"rssi\":%d}",
           BALISE_ID, m.distance_cm, m.rssi);

  WiFiClientSecure client;
  client.setInsecure();   // TODO(sécurité) : épingler le certificat racine avant la mise en service terrain
  HTTPClient http;
  http.setTimeout(8000);
  if (!http.begin(client, MESURE_URL)) return -1;
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + BALISE_API_KEY);
  int code = http.POST((uint8_t *)corps, strlen(corps));
  http.end();
  return code;
}

static void traiterFile() {
  if (fileTaille == 0 || (int32_t)(millis() - prochainEnvoi) < 0) return;

  const Mesure &m = file[fileTete];
  int code = envoyer(m);

  if (code == 201) {
    Serial.printf("[envoi] 201 OK  %.1f cm (reste %u)\n", m.distance_cm, (unsigned)(fileTaille - 1));
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
  } else {                                               // 401, 5xx, pas de réseau…
    if (code == 401) Serial.println("[envoi] 401 clé de balise invalide (vérifier secrets.h)");
    else Serial.printf("[envoi] échec (%d), nouvel essai dans %lu s\n", code, (unsigned long)(attenteMs / 1000));
    echecEnvoi = true;
    prochainEnvoi = millis() + attenteMs;
    attenteMs = min<uint32_t>(attenteMs * 2, 60000);
  }
}

static void majLed() {
  bool erreur = echecEnvoi || WiFi.status() != WL_CONNECTED;
  uint32_t demiPeriode = erreur ? 100 : 1000;            // rapide = erreur, lente = OK
  digitalWrite(PIN_LED, (millis() / demiPeriode) % 2);
}

// ── Arduino ──────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
#if defined(CAPTEUR_TRIG_ECHO)
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
#else
  Serial2.begin(9600, SERIAL_8N1, PIN_RX2, PIN_TX2);
#endif
  Serial.printf("\nMbënnScan balise %s — intervalle %d ms\n", BALISE_ID, MESURE_INTERVALLE_MS);
  connecterWifi();
}

void loop() {
  uint32_t now = millis();

  // Reconnexion Wi-Fi si coupée depuis plus de 10 s
  if (WiFi.status() != WL_CONNECTED && now - dernierWifi > 10000) {
    Serial.println("[wifi] reconnexion…");
    WiFi.disconnect();
    connecterWifi();
  }

  if ((int32_t)(now - prochaineMesure) >= 0) {
    prochaineMesure = now + MESURE_INTERVALLE_MS;
    float d = mesurerMediane();
    if (isnan(d)) {
      Serial.println("[mesure] lecture invalide (hors 20–600 cm ou capteur muet), ignorée");
    } else {
      Mesure m = { d, WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -120 };
      Serial.printf("[mesure] %.1f cm, rssi %d, file %u\n", m.distance_cm, m.rssi, (unsigned)(fileTaille + 1));
      empiler(m);
    }
  }

  traiterFile();
  majLed();
  delay(5);
}
