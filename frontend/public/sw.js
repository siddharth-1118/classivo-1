// public/sw.js
// Production-grade service worker for SPA
// - network-first for navigation & API
// - cache-first for static assets (scripts/styles/images)
// - cache trimming + versioning
// - client notifications on update

const CACHE_VERSION = "v1-20251117"; // bump this on every deploy (or inject during build)
const PRECACHE = `Classivo-precache-${CACHE_VERSION}`;
const RUNTIME = `Classivo-runtime-${CACHE_VERSION}`;
const API_CACHE = `Classivo-api-${CACHE_VERSION}`;

// Put build-time hashed assets here (recommended). Keep "/" out if you want network-first nav.
const PRECACHE_URLS = [
  "/favicon.ico",
  "/favicon-96x96.png",
  "/favicon.svg",
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
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
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

  // 3) Navigation (SPA routes) -> network-first, fallback to cached precache index or offline page
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetchWithTimeout(request, 8000);
          // optionally, cache the navigation response in runtime for offline fallback, but avoid caching forever
          // skip putting whole index into cache to avoid serving stale shell; only put if you'd like offline support
          return networkResponse;
        } catch (err) {
          // fallback: try to serve a cached precached index.html (if you precached one)
          const cache = await caches.open(PRECACHE);
          const cachedIndex = await cache.match("/");
          if (cachedIndex) return cachedIndex;
          // If you didn't precache "/", try runtime cache
          const runtimeCached = await caches.match(request);
          if (runtimeCached) return runtimeCached;
          return new Response(
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Offline | Classivo SRM</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --gold: #D4AF37;
      --obsidian: #09090b;
    }
    body {
      background-color: var(--obsidian);
      color: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      height: 100vh;
      margin: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
    }
    .orb {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, var(--gold), transparent);
      border: 1px solid rgba(212, 175, 55, 0.3);
      margin-bottom: 2rem;
      animation: pulse 2s infinite ease-in-out;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem; color: var(--gold); }
    p { color: #888; margin: 0 0 2rem; max-width: 300px; line-height: 1.5; }
    button {
      background: var(--gold);
      color: black;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:active { transform: scale(0.95); }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 rgba(212, 175, 55, 0); }
      50% { transform: scale(1.05); opacity: 0.8; box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
    }
  </style>
</head>
<body>
  <div class="orb"></div>
  <h1>Connection Interrupted</h1>
  <p>You appear to be offline. Classivo requires an active link to the SRM Command Center.</p>
  <button onclick="window.location.reload()">Re-establish Link</button>
</body>
</html>`,
  { headers: { "Content-Type": "text/html" }, status: 200 }
);
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
      .catch(() => caches.match(request))
  );
});

