const DB_NAME = "audit-offline-db";
const DB_VERSION = 6;
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

/* Guardar foto local */
export async function savePhotoOffline(photo: {
  audit_item_id: number;
  file: Blob;
  name: string;
  type: string;
}) {
  const db = await getDB();
  const tx = db.transaction(PHOTO_QUEUE, "readwrite");
  const store = tx.objectStore(PHOTO_QUEUE);

  store.add({
    ...photo,
    url: `/api/v1/audit-items/${photo.audit_item_id}/photos`,
    created_at: new Date().toISOString(),
  });

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
