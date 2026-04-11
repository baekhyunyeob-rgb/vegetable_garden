// 개발 모드 - 캐시 사용 안 함
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
// fetch 이벤트 없음 → 항상 네트워크에서 직접 받아옴
