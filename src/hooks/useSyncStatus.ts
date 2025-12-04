import { useEffect, useState } from "react";

const DB_NAME = "audit-offline-db";
const DB_VERSION = 9;
const API_QUEUE = "api-queue";
const PHOTO_QUEUE = "photo-queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      console.log("[useSyncStatus] onupgradeneeded → creando stores");

      if (!db.objectStoreNames.contains(API_QUEUE)) {
        db.createObjectStore(API_QUEUE, { autoIncrement: true });
        console.log("[useSyncStatus] API_QUEUE creado");
      }

      if (!db.objectStoreNames.contains(PHOTO_QUEUE)) {
        db.createObjectStore(PHOTO_QUEUE, { autoIncrement: true });
        console.log("[useSyncStatus] PHOTO_QUEUE creado");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export default function useSyncStatus() {
  const [pending, setPending] = useState(false);
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  async function checkPending() {
    try {
      const db = await openDB();

      // Contar pendientes de API
      const tx1 = db.transaction(API_QUEUE, "readonly");
      const count1 = await new Promise<number>((resolve) => {
        const r = tx1.objectStore(API_QUEUE).count();
        r.onsuccess = () => resolve(r.result);
      });

      // Contar fotos pendientes
      const tx2 = db.transaction(PHOTO_QUEUE, "readonly");
      const count2 = await new Promise<number>((resolve) => {
        const r = tx2.objectStore(PHOTO_QUEUE).count();
        r.onsuccess = () => resolve(r.result);
      });

      setPending(count1 > 0 || count2 > 0);
    } catch (e) {
      console.warn("[useSyncStatus] Error al verificar pendientes:", e);
      setPending(false);
    }
  }

  useEffect(() => {
    checkPending();

    const onOnline = () => {
      setOnline(true);
      checkPending();
    };
    const onOffline = () => {
      setOnline(false);
      setPending(true);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return { pending, online };
}
