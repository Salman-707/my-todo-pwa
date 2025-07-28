// IMPORTANT: Increment CACHE_NAME any time you change urlsToCache or sw.js logic
const CACHE_NAME = 'my-todo-pwa-cache-v4'; // <--- CACHE VERSION INCREMENTED
const urlsToCache = [
    '/my-todo-pwa/', // <--- IMPORTANT: This caches the root of your PWA
    '/my-todo-pwa/index.html',
    '/my-todo-pwa/style.css',
    '/my-todo-pwa/app.js',
    '/my-todo-pwa/manifest.json',
    '/my-todo-pwa/images/icon-192x192.png',
    '/my-todo-pwa/images/icon-512x512.png'
];

// --- Install Event ---
self.addEventListener('install', event => {
    console.log('Service Worker: Install event fired.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('Service Worker: Caching failed', err);
            })
    );
});

// --- Activate Event ---
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate event fired.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// --- Fetch Event ---
self.addEventListener('fetch', event => {
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Service Worker: Fetching from cache:', event.request.url);
                        return response;
                    }

                    console.log('Service Worker: Fetching from network:', event.request.url);
                    return fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }
                            return networkResponse;
                        })
                        .catch(error => {
                            console.error('Service Worker: Fetch failed for:', event.request.url, error);
                            // Optional: return an offline page or fallback content here
                        });
                })
        );
    }
});
