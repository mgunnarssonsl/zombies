// Offline cache for the installed app. Pages load network-first so updates arrive
// when online; hashed build files and fonts are served cache-first.
const CACHE = 'zombies-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const networkFirst = req.mode === 'navigate' || !req.url.includes('/assets/');
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // no-cache: GitHub Pages lets browsers reuse files for 10 minutes, which would hide a new version
      const fetchAndStore = fetch(req, networkFirst ? { cache: 'no-cache' } : undefined).then((res) => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      if (networkFirst) return fetchAndStore.catch(() => cache.match(req));
      return (await cache.match(req)) ?? fetchAndStore;
    }),
  );
});
