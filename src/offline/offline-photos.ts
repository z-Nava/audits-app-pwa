const DB_NAME = "audit-offline-db";
const DB_VERSION = 9;
const PHOTO_QUEUE = "photo-queue";
const API_QUEUE = "api-queue";

/* Abrir IndexedDB */
function getDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    console.log("[offline-photos] IndexedDB open request made");

    req.onupgradeneeded = () => {
      const db = req.result;
      console.log("[offline-photos] Upgrading IndexedDB to version", DB_VERSION);

      if (!db.objectStoreNames.contains(API_QUEUE)) {
        db.createObjectStore(API_QUEUE, { autoIncrement: true });
        console.log("[offline-photos] API_QUEUE object store created");
      }

      if (!db.objectStoreNames.contains(PHOTO_QUEUE)) {
        db.createObjectStore(PHOTO_QUEUE, { autoIncrement: true });
        console.log("[offline-photos] PHOTO_QUEUE object store created");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* Guardar foto local offline */
export async function savePhotoOffline(photo: {
  audit_item_id: number;
  file: Blob;
  name: string;
  type: string;
}) {
  console.log("[offline-photos] savePhotoOffline() llamado con:", photo);

  const db = await getDB();
  console.log("[offline-photos] DB abierta en versión", DB_VERSION);

  const tx = db.transaction(PHOTO_QUEUE, "readwrite");
  const store = tx.objectStore(PHOTO_QUEUE);

  /** 🔥 Extraer token real desde audit-session */
  let token: string | null = null;
  const session = localStorage.getItem("audit-session");

  if (session) {
    try {
      const parsed = JSON.parse(session);
      token = parsed?.state?.token ?? null;
    } catch (e) {
      console.warn("[offline-photos] ERROR parseando audit-session:", e);
    }
  }

  console.log("[offline-photos] Token encontrado:", token);

  const data = {
    ...photo,
    url: `http://localhost:8000/api/v1/audit-items/${photo.audit_item_id}/photos`,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        }
      : {
          Accept: "application/json",
        },
    created_at: new Date().toISOString(),
  };

  console.log("[offline-photos] A punto de guardar en PHOTO_QUEUE:", data);

  const addReq = store.add(data);

  addReq.onsuccess = () => {
    console.log(
      "[offline-photos] add() OK. Nueva entrada PHOTO_QUEUE key:",
      addReq.result
    );
  };

  addReq.onerror = () => {
    console.error("[offline-photos] ERROR en add():", addReq.error);
  };

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      console.log("[offline-photos] TX completa ✔ Foto guardada offline");
      resolve();
    };
    tx.onerror = () => {
      console.error("[offline-photos] TX error:", tx.error);
      reject(tx.error as any);
    };
    tx.onabort = () => {
      console.error("[offline-photos] TX abort:", tx.error);
      reject(tx.error as any);
    };
  });
}

/* Registrar Background Sync si está disponible */
export async function registerSyncPhotos() {
  if (!("serviceWorker" in navigator)) return;

  const reg = await navigator.serviceWorker.ready;

  if ("sync" in reg) {
    try {
      await (reg as any).sync.register("sync-photos");
      console.log("[offline-photos] sync-photos registrado");
    } catch (err) {
      console.warn("[offline-photos] ERROR registrando sync-photos", err);
    }
  } else {
    console.log(
      "[offline-photos] Background Sync NO soportado — fallback manual"
    );
  }
}
