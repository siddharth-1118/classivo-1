// public/sw.js
// Production-grade service worker for SPA
// - network-first for navigation & API
// - cache-first for static assets (scripts/styles/images)
// - cache trimming + versioning
// - client notifications on update

const CACHE_VERSION = "v4-20260317"; // bump this on every deploy (or inject during build)
const PRECACHE = `Classivo-precache-${CACHE_VERSION}`;
const RUNTIME = `Classivo-runtime-${CACHE_VERSION}`;
const API_CACHE = `Classivo-api-${CACHE_VERSION}`;

// Put build-time hashed assets here (recommended). Keep "/" out if you want network-first nav.
const PRECACHE_URLS = [
  "/classivo-tab-icon.svg",
  "/site.webmanifest",
  // Add other hashed JS/CSS produced by your build, e.g. "/_next/static/chunks/app-abc123.js"
];

// Runtime cache settings
const MAX_ASSET_ENTRIES = 60; // max cached static assets
const MAX_API_ENTRIES = 50;   // max cached API responses
const MAX_ASSET_AGE = 60 * 60 * 24 * 7; // in seconds => 7 days
const MAX_API_AGE = 60 * 60 * 24; // 1 day for API fallback

const UPDATE_MESSAGE = "Classivo_SW_UPDATED";

// helper: send message to all clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage(message);
  }
}

// trim a cache to max entries (FIFO)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const removeCount = keys.length - maxEntries;
  for (let i = 0; i < removeCount; i++) {
    await cache.delete(keys[i]);
  }
}

// safe fetch utility with timeout
function fetchWithTimeout(request, timeout = 30000) {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(new Error("timeout"));
    }, timeout);

    fetch(request)
      .then((res) => {
        if (timedOut) return;
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        if (timedOut) return;
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Install: precache core assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (e) {
        // ignore individual failures
        console.warn("Precaching failed:", e);
      }
    })()
  );
});

// Activate: cleanup old caches and notify clients of update
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![PRECACHE, RUNTIME, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await notifyClients({ type: UPDATE_MESSAGE, version: CACHE_VERSION });
      await self.clients.claim();
    })()
  );
});

// Helper: respond with cached asset (cache-first) for static resources
async function cacheFirst(request) {
  if (!request.url.startsWith("http://") && !request.url.startsWith("https://")) {
    return fetch(request);
  }

  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      try {
        await cache.put(request, response.clone());
      } catch (_) {
        // Some browser-internal and extension URLs cannot be cached.
      }
      // trim cache
      trimCache(RUNTIME, MAX_ASSET_ENTRIES).catch(() => {});
    }
    return response;
  } catch (err) {
    return cached || new Response(null, { status: 504, statusText: "Gateway Timeout" });
  }
}

// Helper: network-first for APIs and navigations, but update cache for fallback
async function networkFirstWithCacheFallback(request, cacheName = API_CACHE) {
  if (!request.url.startsWith("http://") && !request.url.startsWith("https://")) {
    return fetch(request);
  }

  const cache = await caches.open(cacheName);
  try {
    // try network with a modest timeout
    const networkResponse = await fetchWithTimeout(request, 8000);
    if (networkResponse && networkResponse.ok) {
      try {
        cache.put(request, networkResponse.clone());
        // trim API cache
        trimCache(cacheName, MAX_API_ENTRIES).catch(() => {});
      } catch (e) {
        // ignore cache put errors
      }
    }
    return networkResponse;
  } catch (err) {
    // network failed or timed out -> fallback to cache
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(null, { status: 504, statusText: "Gateway Timeout" });
  }
}

// message handler (allows client to skipWaiting or clear caches)
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (data.type === "CLEAR_CACHES") {
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    })();
  }
});

// Main fetch handler
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Don't interfere with devtools/extension or cross-origin opaque requests badly
  if (request.method !== "GET") {
    // For non-GET, just pass through
    return;
  }

  // 1) API requests: network-first with cache-fallback (stale-while-revalidate style)
  if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
    event.respondWith(networkFirstWithCacheFallback(request, API_CACHE));
    return;
  }

  // 2) Static assets (scripts/styles/images/fonts) -> cache-first
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3) Navigation (SPA routes) -> network-first, fallback to cached app shell only
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetchWithTimeout(request, 8000);
          // optionally, cache the navigation response in runtime for offline fallback, but avoid caching forever
          // skip putting whole index into cache to avoid serving stale shell; only put if you'd like offline support
          return networkResponse;
        } catch (err) {
          const cache = await caches.open(PRECACHE);
          const cachedIndex = await cache.match("/");
          if (cachedIndex) return cachedIndex;
          const runtimeCached = await caches.match(request);
          if (runtimeCached) return runtimeCached;
          return new Response("Service unavailable", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      })()
    );
    return;
  }

  // 4) Default: network-first then cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        // optionally cache generic responses? skip for safety
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response("Service unavailable", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});


self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/app/messmenu'));
});

