const CACHE_VERSION = 'culinara-v1';
const PRECACHE_URLS = ['/offline', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;               // never touch mutations
  if (request.headers.has('Next-Action')) return;     // never touch Server Actions
  if (request.mode !== 'navigate') return;             // only handle full page loads

  event.respondWith(
    fetch(request).catch(() => caches.match('/offline'))
  );
});
