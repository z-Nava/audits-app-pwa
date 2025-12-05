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
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
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
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  helpCircleOutline,
  sendOutline,
} from "ionicons/icons";

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

    setLoading(true);
    try {
      await AuditService.updateItem(item.id, payload);
      await AuditService.submitAudit(audit.id);

      alert("Auditoría enviada correctamente");
      history.push("/assignments");
    } catch (e: any) {
      console.error("Error al enviar auditoría", e);

      if (e.code === "ERR_NETWORK") {
        alert(
          "Estás offline. La auditoría se guardará y enviará al volver la conexión."
        );
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
      <IonContent fullscreen>
        <div
          style={{
            minHeight: "100%",
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #4a0404 100%)",
            padding: "20px",
          }}
        >
          <IonLoading isOpen={loading} message={"Procesando..."} />

          {/* 🔥 Banner de estado de conexión / sync */}
          {!online ? (
            <div
              style={{
                background: "#e0ac08",
                color: "#000",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              🔴 Offline — Progreso guardado localmente
            </div>
          ) : pending ? (
            <div
              style={{
                background: "#3dc2ff",
                color: "#fff",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              🟡 Sincronizando cambios…
            </div>
          ) : (
            <div
              style={{
                background: "rgba(45, 211, 111, 0.2)",
                color: "#2dd36f",
                border: "1px solid #2dd36f",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              🟢 Todo sincronizado ✔
            </div>
          )}

          {!audit && <IonText color="light">Cargando auditoría...</IonText>}

          {audit && item && (
            <IonGrid fixed>
              <AuditHeader audit={audit} />

              <IonCard
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                  marginTop: "20px",
                  marginInline: "0",
                }}
              >
                <IonCardContent>
                  {/* RESULTADO */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        marginBottom: "12px",
                      }}
                    >
                      Resultado
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "10px",
                      }}
                    >
                      {(["PASS", "FAIL", "NA"] as const).map((val) => {
                        const isSelected = item.result === val;
                        let color = "#505050";
                        let icon = helpCircleOutline;

                        if (val === "PASS") {
                          color = "#28a745";
                          icon = checkmarkCircleOutline;
                        }
                        if (val === "FAIL") {
                          color = "#dc3545";
                          icon = closeCircleOutline;
                        }
                        if (val === "NA") {
                          color = "#6c757d";
                          icon = helpCircleOutline;
                        }

                        return (
                          <button
                            key={val}
                            disabled={readOnly}
                            onClick={() => handleResultChange(val)}
                            style={{
                              background: isSelected
                                ? color
                                : "rgba(255,255,255,0.05)",
                              border: `1px solid ${
                                isSelected ? color : "rgba(255,255,255,0.1)"
                              }`,
                              color: isSelected ? "#fff" : "#aaa",
                              padding: "12px",
                              borderRadius: "12px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <IonIcon
                              icon={icon}
                              style={{ fontSize: "1.5rem" }}
                            />
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FOTO */}
                  <div style={{ marginBottom: "24px" }}>
                    <AuditPhotos
                      photos={photos}
                      readOnly={readOnly}
                      onAddPhoto={readOnly ? undefined : addPhoto}
                    />
                  </div>

                  {/* COMENTARIOS */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        marginBottom: "12px",
                      }}
                    >
                      Comentarios
                    </h3>
                    <textarea
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        minHeight: "100px",
                        resize: "vertical",
                        outline: "none",
                      }}
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
                      shape="round"
                      onClick={submitAudit}
                      style={{
                        "--background":
                          "linear-gradient(90deg, #C8102E 0%, #9b0c23 100%)",
                        "--box-shadow": "0 4px 15px rgba(200, 16, 46, 0.4)",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        height: "50px",
                        marginTop: "20px",
                      }}
                    >
                      <IonIcon slot="start" icon={sendOutline} />
                      ENVIAR AUDITORÍA
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            </IonGrid>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuditDetail;
