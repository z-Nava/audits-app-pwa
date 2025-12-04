// src/pages/Audits/AuditDetail.tsx

import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonText,
  IonButton,
  IonLoading,
  IonCard,
  IonCardContent,
} from "@ionic/react";

import { useParams, useHistory } from "react-router-dom";
import { Audit, AuditItem } from "../../types/audits";
import { AuditService } from "../../services/AuditService";
import { savePhotoOffline } from "../../offline/offline-photos";
import api from "../../services/api";

import useOnlineStatus from "../../hooks/useOnlineStatus";
import useSyncStatus from "../../hooks/useSyncStatus";

import AuditHeader from "./components/AuditHeader";
import AuditPhotos from "./components/AuditPhotos";

// 👇 Tipo local para manejar estado visual de cada foto
interface AuditPhoto {
  url: string;
  synced: boolean;
}

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const isOnline = useOnlineStatus();
  const { pending, online } = useSyncStatus();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [item, setItem] = useState<AuditItem | null>(null);
  const [photos, setPhotos] = useState<AuditPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const readOnly = audit?.status !== "in_progress";

  async function loadAudit() {
    if (!id) return;
    setLoading(true);

    try {
      const data = await AuditService.getAudit(Number(id));
      setAudit(data);

      // Tomamos el primer ítem o lo creamos si no existe
      let auditItem: AuditItem | null = data.items?.[0] ?? null;

      if (!auditItem) {
        const toolId = data.assignment.tools![0].id;
        auditItem = await AuditService.createItem(data.id, toolId);
      }

      setItem(auditItem);
      // Si quisieras, aquí podrías cargar fotos ya existentes del backend
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Cambiar RESULTADO
  async function handleResultChange(result: "PASS" | "FAIL" | "NA") {
  if (!item || readOnly) return;

  const updatedLocal: AuditItem = { ...item, result };
  setItem(updatedLocal);

  // 🔥 Si estamos offline → NO LLAMAR AXIOS
  

  try {
    await AuditService.updateItem(item.id, {
      result,
      comments: updatedLocal.comments ?? "",
      defects: updatedLocal.defects ?? "",
    });

  } catch (e) {
    console.error("Error al actualizar resultado", e);
  }
}


  // 🔹 Comentarios: SOLO actualizamos estado local (el submit ya envía todo)
  function handleCommentsChange(text: string) {
    if (!item) return;
    setItem({ ...item, comments: text });
  }

  // 📸 Subir UNA foto (offline/online)
  async function addPhoto(file: File) {
    if (!item) return;

    // OFFLINE → guardamos en IndexedDB y mostramos como "Pendiente"
    if (!isOnline) {
      await savePhotoOffline({
        audit_item_id: item.id,
        file,
        name: file.name,
        type: file.type,
      });

      const localUrl = URL.createObjectURL(file);

      setPhotos((prev) => [
        ...prev,
        { url: localUrl, synced: false }, // 🔴 pendiente de sync
      ]);

      alert("📌 Foto guardada offline. Se subirá al recuperar conexión.");
      return;
    }

    // ONLINE → flujo normal hacia API
    const form = new FormData();
    form.append("photo", file);

    const resp = await api.post(`/audit-items/${item.id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPhotos((prev) => [
      ...prev,
      {
        url: resp.data.url || resp.data.path,
        synced: true,
      },
    ]);
  }

  // 🔴 Botón FINAL: guarda todo + envía auditoría
  async function submitAudit() {
  if (!audit || !item) return;

  if (!item.result) {
    alert("Debes seleccionar un resultado (PASS / FAIL / NA).");
    return;
  }

  const payload = {
    result: item.result ?? "NA",
    comments: item.comments ?? "",
    defects: item.defects ?? "",
  };

  // 🚫 1. SI ESTÁS OFFLINE → NO SE LLAMA A AXIOS

  // 🌐 2. ONLINE → flujo normal
  setLoading(true);
  try {
    await AuditService.updateItem(item.id, payload);
    await AuditService.submitAudit(audit.id);

    alert("Auditoría enviada correctamente");
    history.push("/assignments");

  } catch (e: any) {
    console.error("Error al enviar auditoría", e);

    if (e.code === "ERR_NETWORK") {
      alert("Estás offline. La auditoría se guardará y enviará al volver la conexión.");
      history.push("/assignments");
      return;
    }

    alert("Ocurrió un error al enviar la auditoría.");
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding bg-darkBg text-white font-poppins">
        <IonLoading isOpen={loading} message={"Procesando..."} />

        {/* 🔥 Banner de estado de conexión / sync */}
        {!online ? (
          <div className="w-full text-center p-2 mb-3 bg-yellow-600 text-black rounded-lg font-semibold">
            🔴 Offline — Progreso guardado localmente
          </div>
        ) : pending ? (
          <div className="w-full text-center p-2 mb-3 bg-blue-600 text-white rounded-lg font-semibold animate-pulse">
            🟡 Sincronizando cambios…
          </div>
        ) : (
          <div className="w-full text-center p-2 mb-3 bg-green-600 text-white rounded-lg font-semibold">
            🟢 Todo sincronizado ✔
          </div>
        )}

        {!audit && <IonText>Cargando auditoría...</IonText>}

        {audit && item && (
          <>
            <AuditHeader audit={audit} />

            <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl mt-4 shadow-md">
              <IonCardContent className="space-y-4">
                {/* RESULTADO */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Resultado</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(["PASS", "FAIL", "NA"] as const).map((val) => (
                      <button
                        key={val}
                        disabled={readOnly}
                        onClick={() => handleResultChange(val)}
                        className={`py-3 rounded-xl font-bold border 
                          ${
                            item.result === val
                              ? "bg-primaryRed border-primaryRed text-white"
                              : "bg-[#222] border-gray-600 text-gray-300"
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FOTO */}
                <AuditPhotos
                  photos={photos}
                  readOnly={readOnly}
                  onAddPhoto={readOnly ? undefined : addPhoto}
                />

                {/* COMENTARIOS */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Comentarios</h3>
                  <textarea
                    className="w-full p-3 bg-[#111] rounded-xl text-white border border-gray-700"
                    placeholder="Escribe comentarios adicionales..."
                    disabled={readOnly}
                    value={item.comments ?? ""}
                    onChange={(e) => handleCommentsChange(e.target.value)}
                  />
                </div>

                {/* BOTÓN ENVIAR */}
                {!readOnly && (
                  <IonButton
                    expand="block"
                    className="bg-primaryRed mt-2 h-12 rounded-xl font-bold tracking-wide"
                    onClick={submitAudit}
                  >
                    ENVIAR AUDITORÍA
                  </IonButton>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AuditDetail;
