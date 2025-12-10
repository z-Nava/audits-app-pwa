/* ======================================================
   Milwaukee Audits PWA - Offline + Sync + Photos v5.1
====================================================== */

console.log("[SW] Running v5.1 🚀");

const APP_VERSION = "v2.2.5"; // Bumped version
const STATIC_CACHE = `static-${APP_VERSION}`;
const API_CACHE = `api-${APP_VERSION}`;
const DB_NAME = "audit-offline-db";
const DB_VERSION = 9;

const API_QUEUE = "api-queue";
const PHOTO_QUEUE = "photo-queue";
const OFFLINE_URL = "/offline.html";

const STATIC_FILES = ["/", "/offline.html"];

/* Incorporar assets de Vite (injectManifest) */
const manifest = self.__WB_MANIFEST;
if (manifest) {
  const manifestUrls = manifest.map((entry) => entry.url);
  STATIC_FILES.push(...manifestUrls);
}

/* Install */
self.addEventListener("install", (event) => {
  const uniqueFiles = [...new Set(STATIC_FILES)]; // Deduplicate
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll(uniqueFiles))
      .catch((e) => console.error("[SW] Install Error:", e))
  );
  // self.skipWaiting(); // Deshabilitado para update manual
});

/* Escuchar mensaje SKIP_WAITING desde el cliente */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip Waiting message received");
    self.skipWaiting();
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
              console.log("[SW] Deleting old cache:", key);
              return caches.delete(key);
            }
          })
        );
      }),
    ])
  );
  console.log("[SW] Activated v5.1!");
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
   Queue API Offline  ✅ ARREGLADA
====================================================== */
async function queueRequest(req) {
  // 1️⃣ Primero serializamos (fuera de la transacción)
  const serialized = await serializeRequest(req);

  // 2️⃣ Luego abrimos DB y transacción SIN awaits en medio
  const db = await openDB();
  const tx = db.transaction(API_QUEUE, "readwrite");
  const store = tx.objectStore(API_QUEUE);

  store.add(serialized);

  // 3️⃣ Esperamos a que termine la transacción
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  if (self.registration.sync) {
    try {
      await self.registration.sync.register("sync-api");
      await self.registration.sync.register("sync-photos");
      console.log("[SW] sync-api y sync-photos registrados");
    } catch (e) {
      console.warn("[SW] No se pudo registrar BG Sync:", e);
    }
  }

  self.addEventListener("online", () => {
    console.log("[SW] ONLINE → Sync start");
    syncApiQueue();
    syncPhotoQueue();
  });

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

function getApiQueueEntries() {
  return new Promise(async (resolve) => {
    console.log("[SW] getApiQueueEntries: start");
    const db = await openDB();
    const tx = db.transaction(API_QUEUE, "readonly");
    const store = tx.objectStore(API_QUEUE);
    const entries = [];

    const req = store.openCursor();

    req.onerror = () => {
      console.error("[SW] getApiQueueEntries error:", req.error);
      resolve(entries); // devolvemos lo que haya
    };

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        console.log("[SW] getApiQueueEntries: done, total:", entries.length);
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
/* ======================================================
   Procesar colas API (versión sin cursor + await)
====================================================== */
async function syncApiQueue() {
  console.log(
    "%c[SW] syncApiQueue START 🚀",
    "color: yellow; font-weight: bold"
  );

  const entries = await getApiQueueEntries();
  console.log("[SW] Entries to sync:", entries.length);

  for (const { key, value } of entries) {
    console.log("[SW] Processing entry key:", key, "value:", value);

    if (!value || typeof value !== "object" || !value.url) {
      console.warn("[SW] Invalid entry, deleting...", key, value);
      await deleteApiQueueEntry(key);
      continue;
    }

    const { url, method, headers, body } = value;
    console.log("%c[SW] Sending:", "color: magenta", { method, url, body });

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: method === "GET" || method === "HEAD" ? undefined : body,
      });

      console.log("%c[SW] Response:", "color: lightgreen", res.status, url);

      if (!res.ok) {
        console.warn(
          "%c[SW] Server error, deteniendo la sync ⚠",
          "color: orange",
          res.status,
          url
        );
        break;
      }

      await deleteApiQueueEntry(key);
    } catch (err) {
      console.error(
        "%c[SW] Fetch ERROR ❌, deteniendo la sync",
        "color: red",
        err
      );
      break;
    }
  }

  console.log(
    "%c[SW] syncApiQueue FINISHED 🟢",
    "color: lime; font-weight: bold"
  );
}

/* Helper para borrar una entrada por key en una transacción corta */
function deleteApiQueueEntry(key) {
  return new Promise(async (resolve) => {
    console.log("[SW] Deleting entry from API_QUEUE:", key);
    const db = await openDB();
    const tx = db.transaction(API_QUEUE, "readwrite");
    const store = tx.objectStore(API_QUEUE);
    store.delete(key);

    tx.oncomplete = () => {
      console.log("%c[SW] DELETE OK ❤️ key=" + key, "color: lightgreen");
      resolve();
    };
    tx.onerror = (e) => {
      console.warn("%c[SW] DELETE FAILED ⚠ key=" + key, "color: orange", e);
      resolve(); // no bloqueamos todo por esto
    };
  });
}

/* Procesar cola de fotos */
/* Procesar cola de fotos (versión correcta con IDBRequest) */
async function syncPhotoQueue() {
  console.log("[SW] syncPhotoQueue START 📸");

  const db = await openDB();
  const tx = db.transaction(PHOTO_QUEUE, "readwrite");
  const store = tx.objectStore(PHOTO_QUEUE);

  return new Promise((resolve) => {
    const req = store.openCursor();
    console.log("[SW] openCursor() lanzado sobre PHOTO_QUEUE");

    req.onerror = () => {
      console.error("[SW] Error al abrir cursor de PHOTO_QUEUE:", req.error);
      resolve();
    };

    req.onsuccess = async () => {
      const cursor = req.result;

      if (!cursor) {
        console.log("[SW] No hay más fotos en cola");
        resolve();
        return;
      }

      const entry = cursor.value;
      const key = cursor.primaryKey ?? cursor.key;
      console.log("[SW] Cursor Read:", { key, entry });

      if (!entry?.file || !entry?.url) {
        console.warn("[SW] Entrada inválida → borrando key:", key);
        cursor.delete();
        cursor.continue();
        return;
      }

      const form = new FormData();
      form.append("photo", entry.file, entry.name);
      if (entry.caption) form.append("caption", entry.caption);
      form.append("taken_at", entry.created_at || new Date().toISOString());

      console.log("[SW] FormData keys:", Array.from(form.keys()));

      const headers = entry.headers ? { ...entry.headers } : {};
      delete headers["Content-Type"];

      console.log("[SW] 📤 Subiendo foto a:", entry.url);

      try {
        const res = await fetch(entry.url, {
          method: "POST",
          headers,
          body: form,
        });

        console.log("[SW] Server Response (foto):", res.status);

        if (!res.ok) {
          console.error("[SW] ❌ Falló la subida → se reintentará");
          resolve();
          return;
        }

        console.log("[SW] ✔ Foto enviada OK, borrando key:", key);

        try {
          cursor.delete();
        } catch (e) {
          console.warn("[SW] Error deleting cursor:", e);
        }

        cursor.continue();
      } catch (err) {
        console.error("[SW] ❌ Error de red → retry later:", err);
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
  console.log("[SW] Serializing request:", req.method, req.url);

  const headers = {};
  req.headers.forEach((v, k) => (headers[k] = v));
  console.log("[SW] Headers:", headers);

  let body = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    console.log("[SW] Cloning request for body extraction");
    try {
      body = await req.clone().text();
    } catch (e) {
      console.warn("[SW] Error reading body:", e);
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
