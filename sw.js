// FIX: Added App.html to cache (was missing — offline mode didn't work)
const CACHE_NAME = 'meshmesh-v2';
const CACHE_FILES = [
  '/Meshmesh/',
  '/Meshmesh/index.html',
  '/Meshmesh/App.html',
  '/Meshmesh/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // Don't cache API calls
  if (
    u.hostname.includes('googleapis.com') ||
    u.hostname === 'api.anthropic.com' ||
    u.hostname === 'api.github.com'
  ) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp.ok) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return resp;
    }))
  );
});
