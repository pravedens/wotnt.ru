const CACHE_NAME = 'wotnt-v1';

// Файлы для кэширования при установке
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  '/favicon/favicon.svg',
  '/favicon/favicon-32.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/icon-192.png',
  '/favicon/icon-512.png'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и удаление старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Стратегия кэширования: сначала кэш, потом сеть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // отдаём из кэша
        }
        return fetch(event.request); // идём в сеть
      })
  );
});