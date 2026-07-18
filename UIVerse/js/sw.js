/**
 * Service Worker for UIVerse - Offline Support
 * @module sw
 */

const CACHE_NAME = 'uiverse-cache-v1';
const STATIC_ASSETS = [
  'index.html',
  'js/main.js',
  'js/roadmap.js',
  'js/quiz.js',
  'js/resources.js',
  'js/accordion.js',
  'js/exercises.js',
  'js/utils.js',
  'js/toast.js',
  'data/manifest.json',
  'data/faq.json',
  'data/resources.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests except for Google Fonts and CDN
  const url = new URL(event.request.url);
  
  // In service worker, we need to check if the request is for our own origin
  // by checking if it's a relative URL or matches our expected domains
  const isOwnOrigin = url.origin === self.registration.scope || 
                      url.pathname.startsWith('/js/') ||
                      url.pathname.startsWith('/data/') ||
                      url.pathname === '/' ||
                      url.pathname === '/index.html';
  
  if (!isOwnOrigin && 
      !url.origin.includes('fonts.googleapis.com') && 
      !url.origin.includes('cdn.tailwindcss.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('index.html');
            }
            
            // For other requests, just fail silently
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[ServiceWorker] Cache cleared');
    });
  }
});