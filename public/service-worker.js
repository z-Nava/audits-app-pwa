/* ======================================================
   Milwaukee Audits PWA - Offline + Sync + Photos v5
====================================================== */

console.log("[SW] Running v5 🚀");

const APP_VERSION = "v2.2.0";
const STATIC_CACHE = `static-${APP_VERSION}`;
const API_CACHE = `api-${APP_VERSION}`;
const DB_NAME = "audit-offline-db";
const DB_VERSION = 6;

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
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_FILES)));
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

  const isSameOrigin = url.origin === self.location.origin;
const isApiServer =
  url.origin.includes("localhost:8000") ||
  url.origin.includes("127.0.0.1:8000");

if (!isSameOrigin && !isApiServer) {
  return; // SW no intercepta peticiones externas
}


  console.log("[SW] Fetch:", req.method, req.url);

  // Evitar login/logout (auth) si quieres que no se encoloquen
  if (url.pathname.startsWith("/api/v1/auth")) {
    console.log("[SW] Auth URL, no offline queue:", req.url);
    return;
  }

  // GET → comportamiento normal con fallback
  if (req.method === "GET") {
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(apiNetworkFallback(req));
      return;
    } else {
      event.respondWith(networkFallback(req));
      return;
    }
  }

  // POST / PUT / PATCH / DELETE → intentar red y si falla, encolar
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const reqClone = req.clone(); // ← clon para guardar en cola

    event.respondWith(
      fetch(req).catch(() => {
        console.warn("[SW] Network failed, queuing request:", req.url);
        return queueRequest(reqClone);
      })
    );
    return;
  }
});

/* ======================================================
   Estrategias GET
====================================================== */
async function networkFallback(req) {
  try {
    return await fetch(req);
  } catch {
    return (await caches.match(req)) || (await caches.match(OFFLINE_URL));
  }
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
        status: 200,
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
  const store = tx.objectStore(API_QUEUE);

  const serialized = await serializeRequest(req);
  store.add(serialized);

  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  if (self.registration.sync) {
    try {
      await self.registration.sync.register("sync-api");
    } catch (e) {
      console.warn("[SW] No se pudo registrar sync-api:", e);
    }
  }

  console.warn("[SW] API guardada offline:", req.url);

  return new Response(JSON.stringify({ queued: true, offline: true }), {
    status: 200,
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
  const tx = db.transaction(API_QUEUE, "readwrite");
  const store = tx.objectStore(API_QUEUE);

  console.log("[SW] syncApiQueue called");

  let cursor = await store.openCursor();
  while (cursor) {
    const { url, method, headers, body } = cursor.value;
    try {
      await fetch(url, { method, headers, body });
      console.log("[SW] Request sent:", method, url);
      await cursor.delete();
    } catch (e) {
      console.warn("[SW] Error enviando request, se detiene sync:", e);
      break;
    }
    cursor = await cursor.continue();
  }
}

async function syncPhotoQueue() {
  const db = await openDB();
  const tx = db.transaction(PHOTO_QUEUE, "readwrite");
  const store = tx.objectStore(PHOTO_QUEUE);

  console.log("[SW] syncPhotoQueue called");

  let cursor = await store.openCursor();
  while (cursor) {
    const p = cursor.value;
    console.log("[SW] Uploading photo:", p.name);

    const form = new FormData();
    form.append("photo", new Blob([p.file], { type: p.type }), p.name);

    try {
      await fetch(p.url, { method: "POST", body: form });
      console.log("[SW] Photo uploaded:", p.name);
      await cursor.delete();
    } catch (e) {
      console.warn("[SW] Error subiendo foto, se detiene sync:", e);
      break;
    }

    cursor = await cursor.continue();
  }
}

/* ======================================================
   IndexedDB Unificada
====================================================== */
function openDB() {
  return new Promise((resolve, reject) => {
    console.log("Opening IndexedDB");
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    console.log("IndexedDB open request made");

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(API_QUEUE)) {
        console.log("Creating API_QUEUE object store");
        db.createObjectStore(API_QUEUE, { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(PHOTO_QUEUE)) {
        console.log("Creating PHOTO_QUEUE object store");
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
  if (req.method !== "GET" && req.method !== "HEAD") {
    const clone = req.clone();
    try {
      body = await clone.blob();
    } catch {
      body = null;
    }
  }

  return {
    url: req.url,
    method: req.method,
    headers,
    body,
  };
}
