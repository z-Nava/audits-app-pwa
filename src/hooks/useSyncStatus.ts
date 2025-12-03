import { useEffect, useState } from "react";

export default function useSyncStatus() {
  const [pending, setPending] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  async function checkPending() {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const req = indexedDB.open("audit-offline-db", 3);
      req.onsuccess = () => resolve(req.result);
    });

    const tx1 = db.transaction("api-queue", "readonly");
    const count1 = await new Promise<number>((resolve) => {
      const countReq = tx1.objectStore("api-queue").count();
      countReq.onsuccess = () => resolve(countReq.result);
    });

    const tx2 = db.transaction("pending-photos", "readonly");
    const count2 = await new Promise<number>((resolve) => {
      const countReq2 = tx2.objectStore("pending-photos").count();
      countReq2.onsuccess = () => resolve(countReq2.result);
    });

    setPending(count1 > 0 || count2 > 0);
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
