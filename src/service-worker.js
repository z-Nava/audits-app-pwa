/* ======================================================
   Milwaukee Audits PWA - Offline + Sync + Photos v5.2
====================================================== */

const APP_VERSION = "v5.2.0";
const STATIC_CACHE = `static-${APP_VERSION}`;
const API_CACHE = `api-${APP_VERSION}`;
const DB_NAME = "audit-offline-db";
const DB_VERSION = 9;

const API_QUEUE = "api-queue";
const PHOTO_QUEUE = "photo-queue";
const OFFLINE_URL = "/offline.html";

/* Incorporar assets de Vite (injectManifest) */
/* Install */
self.addEventListener("install", (event) => {
  const manifest = self.__WB_MANIFEST || [];
  const manifestUrls = manifest.map((entry) => entry.url);

  const rawUrls = ["/", "/offline.html", ...manifestUrls];

  const uniqueUrlSet = new Set();
  const filesToCache = [];

  for (const url of rawUrls) {
    try {
      const normalized = new URL(url, self.location).href;
      if (!uniqueUrlSet.has(normalized)) {
        uniqueUrlSet.add(normalized);
        filesToCache.push(normalized);
      }
    } catch (err) {
      // url invalida, ignorar
    }
  }

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll(filesToCache))
      .catch(() => {})
  );
});

/* Escuchar mensajes desde el cliente */
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "SYNC_NOW") {
    syncApiQueue();
    syncPhotoQueue();
  }
});

/* Activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (
              key !== STATIC_CACHE &&
              key !== API_CACHE &&
              (key.startsWith("static-") || key.startsWith("api-"))
            ) {
              return caches.delete(key);
            }
          })
        );
      }),
    ])
  );
});

/* ======================================================
   FETCH Interceptor
====================================================== */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // LOGICA API: Si es una llamada a la API (por path) la procesamos,
  // independientemente del origen (para soportar PROD y DEV).
  // Asumimos que todo lo que empiece por /api/ o tenga api en el path de una llamada ajax es relevante.
  // Ajusta esto si tu backend tiene otro patrón.
  const isApiRequest = url.pathname.includes("/api/");

  const isSameOrigin = url.origin === self.location.origin;

  // Si no es mismo origen Y no es API, ignorar (recursos externos como fuentes, analytics, etc)
  if (!isSameOrigin && !isApiRequest) {
    return;
  }

  // Evitar login/logout (auth) si quieres que no se encoloquen
  if (url.pathname.includes("/auth")) {
    return;
  }

  // GET → comportamiento normal con fallback
  if (req.method === "GET") {
    if (isApiRequest) {
      event.respondWith(apiNetworkFallback(req));
      return;
    } else {
      event.respondWith(networkFallback(req));
      return;
    }
  }

  // POST / PUT / PATCH / DELETE → intentar red y si falla, encolar
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && isApiRequest) {
    const reqClone = req.clone();

    event.respondWith(
      fetch(req).catch(() => {
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
  const serialized = await serializeRequest(req);

  const db = await openDB();
  const tx = db.transaction(API_QUEUE, "readwrite");
  const store = tx.objectStore(API_QUEUE);

  store.add(serialized);

  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  if (self.registration.sync) {
    try {
      await self.registration.sync.register("sync-api");
      await self.registration.sync.register("sync-photos");
    } catch (e) {
      // Fallo registro sync
    }
  }

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
    event.waitUntil(syncApiQueue());
  }
  if (event.tag === "sync-photos") {
    event.waitUntil(syncPhotoQueue());
  }
});

self.addEventListener("online", () => {
  syncApiQueue();
  syncPhotoQueue();
});

function getApiQueueEntries() {
  return new Promise(async (resolve) => {
    const db = await openDB();
    const tx = db.transaction(API_QUEUE, "readonly");
    const store = tx.objectStore(API_QUEUE);
    const entries = [];

    const req = store.openCursor();

    req.onerror = () => {
      resolve(entries);
    };

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(entries);
        return;
      }

      entries.push({
        key: cursor.key,
        value: cursor.value,
      });

      cursor.continue();
    };
  });
}

/* ======================================================
   Procesar colas
====================================================== */
async function syncApiQueue() {
  const entries = await getApiQueueEntries();

  for (const { key, value } of entries) {
    if (!value || typeof value !== "object" || !value.url) {
      await deleteApiQueueEntry(key);
      continue;
    }

    const { url, method, headers, body } = value;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: method === "GET" || method === "HEAD" ? undefined : body,
      });

      if (!res.ok) {
        break;
      }

      await deleteApiQueueEntry(key);
    } catch (err) {
      break;
    }
  }
}

function deleteApiQueueEntry(key) {
  return new Promise(async (resolve) => {
    const db = await openDB();
    const tx = db.transaction(API_QUEUE, "readwrite");
    const store = tx.objectStore(API_QUEUE);
    store.delete(key);

    tx.oncomplete = () => {
      resolve();
    };
    tx.onerror = (e) => {
      resolve();
    };
  });
}

async function syncPhotoQueue() {
  const db = await openDB();
  const tx = db.transaction(PHOTO_QUEUE, "readwrite");
  const store = tx.objectStore(PHOTO_QUEUE);

  return new Promise((resolve) => {
    const req = store.openCursor();

    req.onerror = () => {
      resolve();
    };

    req.onsuccess = async () => {
      const cursor = req.result;

      if (!cursor) {
        resolve();
        return;
      }

      const entry = cursor.value;
      const key = cursor.primaryKey ?? cursor.key;

      if (!entry?.file || !entry?.url) {
        cursor.delete();
        cursor.continue();
        return;
      }

      const form = new FormData();
      form.append("photo", entry.file, entry.name);
      if (entry.caption) form.append("caption", entry.caption);
      form.append("taken_at", entry.created_at || new Date().toISOString());

      const headers = entry.headers ? { ...entry.headers } : {};
      delete headers["Content-Type"];

      try {
        const res = await fetch(entry.url, {
          method: "POST",
          headers,
          body: form,
        });

        if (!res.ok) {
          resolve();
          return;
        }

        try {
          cursor.delete();
        } catch (e) {
          // ignore
        }

        cursor.continue();
      } catch (err) {
        resolve();
      }
    };
  });
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

async function serializeRequest(req) {
  const headers = {};
  req.headers.forEach((v, k) => (headers[k] = v));

  let body = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.clone().text();
    } catch (e) {
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
