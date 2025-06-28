const CACHE_NAME = 'claft-cache-v4-20250119-001';
const urlsToCache = [
  './',
  './index.html',
  './css/navigation.css?v=20250119-001',
  './css/auth.css?v=20250119-001',
  './css/quest.css?v=20250119-001',
  './css/profile.css?v=20250119-001',
  './js/auth.js?v=20250119-001',
  './js/include.js?v=20250119-001',
  './js/supabase.js?v=20250119-001',
  './icons/icon-192.png',
  './icons/icon-512.png'
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

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチイベント（キャッシュ制御）
self.addEventListener('fetch', (event) => {
  // POSTリクエストはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  
  // サポートされていないスキームを除外
  if (url.startsWith('chrome-extension://') || 
      url.startsWith('chrome://') || 
      url.startsWith('moz-extension://') || 
      url.startsWith('safari-extension://') ||
      url.startsWith('file://')) {
    console.log('Skipping unsupported scheme:', url);
    return;
  }

  // Supabase APIリクエストはキャッシュしない
  if (url.includes('supabase.co') || url.includes('supabase-js')) {
    return;
  }
  
  // 外部CDNリクエストもキャッシュしない（念のため）
  if (url.includes('googleapis.com') || 
      url.includes('cdnjs.cloudflare.com') ||
      url.includes('unpkg.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュが見つかればそれを返す
        if (response) {
          return response;
        }

        // キャッシュが見つからない場合はネットワークリクエスト
        return fetch(event.request).then(
          response => {
            // 無効なレスポンスの場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                try {
                  // リクエストのスキームを再度チェック
                  const requestUrl = event.request.url;
                  if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
                    return cache.put(event.request, responseToCache);
                  } else {
                    console.log('Skipping cache.put for non-HTTP scheme:', requestUrl);
                  }
                } catch (e) {
                  console.warn('Failed to cache response:', e.message, 'URL:', event.request.url);
                }
              })
              .catch(e => {
                console.warn('Failed to open cache for storing:', e.message);
              });

            return response;
          }
        );
      })
  );
}); 