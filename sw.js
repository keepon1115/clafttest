// シンプルなService Worker（キャッシュ無効）
self.addEventListener('install', (event) => {
    self.skipWaiting();
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
    return;
}); 