const CACHE_NAME = 'claft-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/navigation.css',
  '/css/auth.css',
  '/js/auth.js',
  '/js/include.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://unpkg.com/@supabase/supabase-js@2.39.0/dist/supabase.min.js'
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

// フェッチイベントは何もしない（キャッシュを使わない）
self.addEventListener('fetch', (event) => {
  // POSTリクエストはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }

  // Supabase APIリクエストはキャッシュしない
  const url = event.request.url;
  if (url.includes('supabase.co') || url.includes('supabase-js')) {
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
                  cache.put(event.request, responseToCache);
                } catch (e) {
                  // cache.put失敗時は何もしない
                }
              });

            return response;
          }
        );
      })
  );
}); 