// Service Worker - INTEGRAL REPUESTOS Cuentas Corrientes
// Sube este número cada vez que subas una nueva versión del sitio,
// así los usuarios reciben la actualización automáticamente.
const CACHE_VERSION = 'ir-cuentas-v1';

const APP_SHELL = [
  './cuentas.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nunca cachear llamadas a la API de sincronización: siempre red.
  if (req.url.includes('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  // Para el resto: red primero, y si falla (sin internet), uso la copia guardada.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
