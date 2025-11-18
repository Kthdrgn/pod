// Service Worker for Podcast PWA
const CACHE_NAME = 'podcast-pwa-v1';
const urlsToCache = [
  '/pod/',
  '/pod/index.html',
  '/pod/landscape.html',
  '/pod/manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          // Allow both 'basic' (same-origin) and 'cors' (cross-origin) responses
          if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-podcasts') {
    event.waitUntil(syncPodcasts());
  }
});

async function syncPodcasts() {
  // Placeholder for syncing podcast data when back online
  console.log('Syncing podcast data...');
}

// Push notifications (optional - for future features)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New podcast episode available!',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('Podcast Player', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
