const CACHE = 'textbat-v5';
const ASSETS = ['/', '/index.html', '/css/style.css', '/js/app.js', '/js/data.js', '/js/screens.js', '/js/nongsaro_db.js', '/js/csv_crop_db.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/') ||
      e.request.url.includes('vworld.kr') ||
      e.request.url.includes('kakao') ||
      e.request.url.includes('nongsaro') ||
      e.request.url.includes('anthropic') ||
      e.request.url.includes('data.go.kr')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
