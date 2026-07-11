// Naliban Farms service worker — installability, light offline support, web push.

const CACHE = 'naliban-v1';
const SHELL = ['/', '/manifest.webmanifest', '/logo.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // never touch Razorpay/Supabase/etc.
    if (url.pathname.startsWith('/api/')) return;    // API calls always hit the network

    // Navigations: network first, fall back to cached shell when offline
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/'))
        );
        return;
    }

    // Static assets (hashed bundles, images, videos): cache first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, copy));
                }
                return response;
            });
        })
    );
});

// ---- Web push ----

self.addEventListener('push', (event) => {
    let payload = { title: 'Naliban Farms', body: 'You have an update from the orchard.', url: '/orders' };
    try {
        payload = { ...payload, ...event.data.json() };
    } catch { /* keep defaults */ }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            data: { url: payload.url }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/orders';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
            for (const win of windows) {
                if (win.url.includes(self.location.origin)) {
                    win.navigate(url);
                    return win.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});
