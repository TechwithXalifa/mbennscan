// Service worker de MbënnScan : l'interface et le fond de carte restent consultables hors ligne.
// Pages : réseau d'abord, cache sinon. Fichiers statiques et tuiles : cache d'abord, mis à jour ensuite.
// Les données passent par src/lib/data.ts, qui garde sa propre copie hors ligne.

const VERSION = "mbennscan-v1";
const ACCUEIL = ["/", "/apres", "/methode", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSION)
      .then((c) => c.addAll(ACCUEIL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function enCache(requete, reponse) {
  if (reponse.ok) {
    const copie = reponse.clone();
    caches.open(VERSION).then((c) => c.put(requete, copie));
  }
  return reponse;
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((r) => enCache(request, r))
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  const statique = url.origin === self.location.origin && /^\/(_next\/static|brand|mocks)\//.test(url.pathname);
  const fondDeCarte = url.hostname === "tiles.openfreemap.org";
  if (statique || fondDeCarte) {
    e.respondWith(
      caches.match(request).then((cache) => {
        const reseau = fetch(request)
          .then((r) => enCache(request, r))
          .catch(() => cache);
        return cache || reseau;
      }),
    );
  }
});
