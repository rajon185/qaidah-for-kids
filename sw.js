// Offline support: cache the app shell, then serve cache-first.
const CACHE = 'qaidah-v6';
const SHELL = ['./', 'index.html', 'styles.css', 'js/data.js', 'js/audio.js', 'js/app.js', 'manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/fonts.css', 'fonts/noto-naskh-arabic-arabic-500-normal.woff2', 'fonts/noto-naskh-arabic-arabic-700-normal.woff2',
  'fonts/nunito-latin-600-normal.woff2', 'fonts/nunito-latin-800-normal.woff2', 'audio/manifest.json',
  'fonts/lateef-arabic-700-normal.woff2'];
// fonts/indopak-quranwbw.ttf is optional (added by you), so it is cached on first use instead.

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      // Keep same-origin files for offline use.
      if (res.ok && e.request.url.startsWith(self.location.origin)) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
