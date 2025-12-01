/* ======================================================
   Milwaukee Audits PWA - Service Worker Estable
   ====================================================== */

const APP_VERSION = "v1.0.1";

const STATIC_CACHE = `static-${APP_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${APP_VERSION}`;
const API_CACHE = `api-${APP_VERSION}`;
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/favicon.png",
  "/assets/icon/icon.png",
];

/* -----------------------------
   INSTALL
----------------------------- */
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando…");

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );

  self.skipWaiting();
});

/* -----------------------------
   ACTIVATE
----------------------------- */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando…");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );

  self.clients.claim();
});

/* -----------------------------
   FETCH HANDLER
----------------------------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ❌ NO CACHEAR POST/PUT/PATCH/DELETE
  if (req.method !== "GET") {
    return;
  }

  const url = new URL(req.url);

  // ------------------------
  // 1. API GET (Laravel)
  // ------------------------
  if (url.pathname.startsWith("/api")) {
    event.respondWith(apiNetworkFirst(req));
    return;
  }

  // ------------------------
  // 2. Recursos estáticos (CSS, JS, images)
  // ------------------------
  if (
    req.destination === "script" ||
    req.destination === "style" ||
    req.destination === "image" ||
    req.destination === "font"
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ------------------------
  // 3. Navegación SPA offline
  // ------------------------
  if (req.mode === "navigate") {
    event.respondWith(pageNetworkFallback(req));
    return;
  }
});

/* ======================================================
   Estrategias de Caché
====================================================== */

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  const res = await fetch(req);
  const cache = await caches.open(DYNAMIC_CACHE);
  cache.put(req, res.clone());
  return res;
}

async function apiNetworkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(API_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;

    return new Response(JSON.stringify({ offline: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function pageNetworkFallback(req) {
  try {
    return await fetch(req);
  } catch (err) {
    return caches.match(OFFLINE_URL);
  }
}
