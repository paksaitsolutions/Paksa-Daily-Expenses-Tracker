// Service Worker for Paksa Daily Expense Tracker
const CACHE_NAME = 'paksa-expense-tracker-v2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/analytics.html',
    '/budget.html',
    '/settings.html',
    '/export.html',
    '/main.js',
    '/db.js',
    '/styles.css',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.12/typed.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Activate event - clean up old caches
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

// Background sync for offline data
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(syncOfflineData());
    }
});

async function syncOfflineData() {
    try {
        // Get offline data from IndexedDB or localStorage
        const offlineData = await getOfflineData();
        
        if (offlineData && offlineData.length > 0) {
            // Send data to server or process locally
            await processOfflineData(offlineData);
            
            // Clear offline queue
            await clearOfflineData();
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function getOfflineData() {
    // Implementation would depend on your offline storage strategy
    return [];
}

async function processOfflineData(data) {
    // Process offline data when connection is restored
    console.log('Processing offline data:', data);
}

async function clearOfflineData() {
    // Clear processed offline data
    console.log('Clearing offline data');
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New expense reminder',
        icon: '/resources/icon-192x192.png',
        badge: '/resources/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/resources/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/resources/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Paksa Daily Expense', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});