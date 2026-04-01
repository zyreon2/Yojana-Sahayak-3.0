/* ─── ArogyaCode Service Worker ─────────────────── */
const CACHE = 'yojana-sahayak-v4';

const PRECACHE = [
  '/Yojana-Sahayak-3.0/',
  '/Yojana-Sahayak-3.0/index.html',
  '/Yojana-Sahayak-3.0/manifest.json',
  '/Yojana-Sahayak-3.0/icon-192.png',
  '/Yojana-Sahayak-3.0/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

/* ── Install: pre-cache all core files ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache first, then network ── */
self.addEventListener('fetch', event => {
  // Never intercept Supabase API calls — always live data
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (
          event.request.method === 'GET' &&
          response && response.status === 200
        ) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return app shell
        if (event.request.destination === 'document') {
          return caches.match('/Yojana-Sahayak-3.0/index.html');
        }
      });
    })
  );
});
