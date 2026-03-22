self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Simple pass-through fetch for an installable PWA without complex caching
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
