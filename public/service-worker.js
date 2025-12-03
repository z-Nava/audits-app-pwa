/* ======================================================
   Milwaukee Audits PWA - Offline + Sync + Photos v5
====================================================== */

console.log("[SW] Running v5 🚀");

const APP_VERSION = "v2.2.0";
const STATIC_CACHE = `static-${APP_VERSION}`;
const API_CACHE = `api-${APP_VERSION}`;
const DB_NAME = "audit-offline-db";
const DB_VERSION = 3;

const API_QUEUE = "api-queue";
const PHOTO_QUEUE = "photo-queue";
const OFFLINE_URL = "/offline.html";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/favicon.png",
];

/* Install */
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_FILES)));
  self.skipWaiting();
});

/* Activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  console.log("[SW] Activated v5!");
});

/* ======================================================
   FETCH Interceptor
====================================================== */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Evitar login/logout offline
  if (url.pathname.startsWith("/api/v1/auth/")) return;

  if (req.method === "GET") {
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(apiNetworkFallback(req));
    } else {
      event.respondWith(networkFallback(req));
    }
    return;
  }

  // Solo manejar modificación sin red
  if (!navigator.onLine && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    event.respondWith(queueRequest(req));
  }
});

/* ======================================================
   Estrategias GET
====================================================== */
async function networkFallback(req) {
  try { return await fetch(req); }
  catch { return caches.match(req) || caches.match(OFFLINE_URL); }
}

async function apiNetworkFallback(req) {
  const cache = await caches.open(API_CACHE);
  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    return (
      cached ||
      new Response(JSON.stringify({ data: [], offline: true }), {
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}

/* ======================================================
   Queue API Offline
====================================================== */
async function queueRequest(req) {
  const db = await openDB();
  const tx = db.transaction(API_QUEUE, "readwrite");
  tx.objectStore(API_QUEUE).add(await serializeRequest(req));
  await tx.done;

  self.registration.sync?.register("sync-api");
  console.warn("[SW] API guardada offline:", req.url);

  return new Response(JSON.stringify({ queued: true, offline: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

/* ======================================================
   BG Sync
====================================================== */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-api") {
    console.warn("[SW] Sync API");
    event.waitUntil(syncApiQueue());
  }
  if (event.tag === "sync-photos") {
    console.warn("[SW] Sync Fotos");
    event.waitUntil(syncPhotoQueue());
  }
});

/* ======================================================
   Procesar colas
====================================================== */
async function syncApiQueue() {
  const db = await openDB();
  const store = db.transaction(API_QUEUE, "readwrite").store;

  let cursor = await store.openCursor();
  while (cursor) {
    const { url, method, headers, body } = cursor.value;
    try {
      await fetch(url, { method, headers, body });
      await cursor.delete();
    } catch { break; }
    cursor = await cursor.continue();
  }
}

async function syncPhotoQueue() {
  const db = await openDB();
  const store = db.transaction(PHOTO_QUEUE, "readwrite").store;

  let cursor = await store.openCursor();
  while (cursor) {
    const p = cursor.value;
    const form = new FormData();
    form.append("photo", new Blob([p.file], { type: p.type }), p.name);

    try {
      await fetch(p.url, { method: "POST", body: form });
      await cursor.delete();
    } catch { break; }

    cursor = await cursor.continue();
  }
}

/* ======================================================
   IndexedDB Unificada
====================================================== */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(API_QUEUE)) {
        db.createObjectStore(API_QUEUE, { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(PHOTO_QUEUE)) {
        db.createObjectStore(PHOTO_QUEUE, { autoIncrement: true });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* Serializar universal */
async function serializeRequest(req) {
  const headers = {};
  req.headers.forEach((v, k) => (headers[k] = v));
  let body = null;
  if (req.method !== "GET") body = await req.clone().blob();
  return { url: req.url, method: req.method, headers, body };
}
