// VolumeApp Service Worker
const CACHE_NAME = 'volumeapp-v1.1.0';
const STATIC_CACHE = 'volumeapp-static-v1.1.0';
const DYNAMIC_CACHE = 'volumeapp-dynamic-v1.1.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/workout/,
    /\/api\/workout-link/
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-http(s) requests (chrome-extension, etc.)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        console.log('[SW] Skipping non-http request:', url.protocol);
        return;
    }

    // Skip requests from different origins (unless it's our API)
    if (url.origin !== self.location.origin && !url.pathname.startsWith('/api/')) {
        console.log('[SW] Skipping cross-origin request:', url.origin);
        return;
    }

    // Handle API requests
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static files
    if (request.method === 'GET') {
        event.respondWith(handleStaticRequest(request));
        return;
    }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Try network first
        const networkResponse = await fetch(request.clone());
        
        if (networkResponse.ok) {
            // Only cache GET requests
            if (request.method === 'GET') {
                try {
                    const cache = await caches.open(DYNAMIC_CACHE);
                    await cache.put(request.clone(), networkResponse.clone());
                } catch (cacheError) {
                    console.warn('[SW] Failed to cache API response:', cacheError);
                    // Continue without caching
                }
            }
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('[SW] Network failed, trying cache for:', url.pathname);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for workout data
        if (url.pathname.includes('/api/workout')) {
            return new Response(JSON.stringify({
                error: 'offline',
                message: 'Dados offline - sincronização pendente'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        throw error;
    }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
    const url = new URL(request.url);

    // Skip caching for chrome-extension and other unsupported schemes
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        console.log('[SW] Skipping unsupported scheme:', url.protocol);
        return fetch(request);
    }

    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback to network
        const networkResponse = await fetch(request);

        if (networkResponse.ok && isCacheable(request)) {
            try {
                // Cache the response
                const cache = await caches.open(DYNAMIC_CACHE);
                await cache.put(request.clone(), networkResponse.clone());
            } catch (cacheError) {
                console.warn('[SW] Failed to cache response:', cacheError);
                // Continue without caching
            }
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Failed to fetch:', request.url, error);

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match('/index.html');
            return offlineResponse || new Response('Offline', { status: 503 });
        }

        throw error;
    }
}

// Helper function to determine if a request should be cached
function isCacheable(request) {
    const url = new URL(request.url);

    // Don't cache chrome-extension or other special schemes
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return false;
    }

    // Don't cache requests with query parameters that look like tracking
    if (url.search.includes('utm_') || url.search.includes('fbclid')) {
        return false;
    }

    // Don't cache POST requests
    if (request.method !== 'GET') {
        return false;
    }

    return true;
}

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'workout-data-sync') {
        event.waitUntil(syncWorkoutData());
    }
});

// Sync workout data when back online
async function syncWorkoutData() {
    try {
        console.log('[SW] Syncing workout data...');
        
        // Get pending sync data from IndexedDB or localStorage
        const pendingData = await getPendingSyncData();
        
        if (pendingData.length > 0) {
            for (const data of pendingData) {
                try {
                    await fetch('/api/workout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    // Remove from pending sync
                    await removePendingSyncData(data.id);
                } catch (error) {
                    console.error('[SW] Failed to sync data:', error);
                }
            }
        }
        
        console.log('[SW] Workout data sync completed');
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Helper functions for sync data management
async function getPendingSyncData() {
    // This would typically use IndexedDB
    // For now, return empty array
    return [];
}

async function removePendingSyncData(id) {
    // This would typically remove from IndexedDB
    console.log('[SW] Removing synced data:', id);
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Hora do treino!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir App',
                icon: '/icons/icon-96.png'
            },
            {
                action: 'dismiss',
                title: 'Dispensar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('VolumeApp', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[SW] Service worker script loaded');
