const CACHE_NAME = 'animex-v4-cache';
const urlsToCache = [
  './index.html',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/animations.css',
  './js/config.js',
  './js/state.js',
  './js/utils.js',
  './js/api.js',
  './js/ui.js',
  './js/watchlist.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('api.jikan.moe')) return;
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
