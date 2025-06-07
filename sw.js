const CACHE_NAME = 'claft-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './profile.html',
  './quest.html',
  './mirai.html',
  './yononaka.html',
  './admin.html',
  './css/navigation.css',
  './css/auth.css',
  './js/include.js',
  './js/supabase.js',
  './js/auth.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 