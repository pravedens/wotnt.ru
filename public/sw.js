// scripts/sw.template.js
const CACHE_NAME = 'wotnt-1785602741823';
const OFFLINE_URL = '/offline';

const urlsToCache = [
  '/',
  '/offline',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for (const url of urlsToCache) {
          try {
            const response = await fetch(url);
            if (response && response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            // Тихо пропускаем ошибки
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key.startsWith('wotnt-')) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  if (url.includes('/version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  
  if (url.includes('/api/') || 
      url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Изображения с Yandex Cloud — StaleWhileRevalidate
  if (url.includes('storage.yandexcloud.net')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) {
            fetch(event.request)
              .then(response => {
                if (response && response.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, response))
                    .catch(() => {});
                }
              })
              .catch(() => {});
            return cached;
          }
          return fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, clone))
                  .catch(() => {});
              }
              return response;
            });
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }
  
  // Все остальные запросы — StaleWhileRevalidate
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, response))
                  .catch(() => {});
              }
            })
            .catch(() => {});
          return cached;
        }
        
        return fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone))
                .catch(() => {});
            }
            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Web Push уведомления (без изменений, но тоже можно убрать логи)
self.addEventListener('push', function(event) {
  let data = {
    title: 'Новое уведомление',
    body: 'У вас новое уведомление',
    icon: '/favicon/icon-192.png',
    badge: '/favicon/favicon-32.png',
    data: { url: '/' }
  };
  
  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: { url: data.data?.url || '/' },
    actions: [
      { action: 'open', title: 'Открыть', icon: '/favicon/favicon-32.png' },
      { action: 'close', title: 'Закрыть', icon: '/favicon/favicon-32.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          for (let client of windowClients) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

self.addEventListener('pushsubscriptionchange', function(event) {
  if (!event.oldSubscription || !event.newSubscription) return;
  
  event.waitUntil(
    fetch('/api/push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: event.newSubscription.endpoint,
        keys: {
          p256dh: event.newSubscription.toJSON().keys.p256dh,
          auth: event.newSubscription.toJSON().keys.auth
        }
      })
    })
  );
});