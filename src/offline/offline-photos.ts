const DB_NAME = "audit-offline-db";
const DB_VERSION = 3;
const PHOTO_QUEUE = "photo-queue";

/* Abrir IndexedDB */
function getDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_QUEUE)) {
        db.createObjectStore(PHOTO_QUEUE, { autoIncrement: true });
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
  tx.objectStore(PHOTO_QUEUE).add({
    ...photo,
    url: `/api/v1/audit-items/${photo.audit_item_id}/photos`,
    created_at: new Date().toISOString(),
  });

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
