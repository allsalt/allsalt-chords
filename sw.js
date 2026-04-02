const CACHE_NAME = 'allsalt-chords-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js',
  ];

self.addEventListener('install', (event) => {
    event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
                  return cache.addAll(ASSETS_TO_CACHE);
          })
        );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
          caches.keys().then((keys) => {
                  return Promise.all(
                            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
                          );
          })
        );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.hostname.includes('firestore') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
          event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
          return;
    }
    event.respondWith(
          caches.match(event.request).then((cached) => {
                  if (cached) return cached;
                  return fetch(event.request).then((response) => {
                            if (response.ok) {
                                        const clone = response.clone();
                                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                            }
                            return response;
                  });
          })
        );
});
