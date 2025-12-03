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
import api from "../../services/api";

import AuditHeader from "./components/AuditHeader";
import AuditPhotos from "./components/AuditPhotos";

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [item, setItem] = useState<AuditItem | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
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
      // si luego cargas fotos desde el backend, aquí setPhotos(...)
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Cambiar RESULTADO: sí guarda inmediato
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
      // Aquí podrías mostrar un toast si quieres
    }
  }

  // 🔹 Comentarios: SOLO actualizamos estado local (sin API)
  function handleCommentsChange(text: string) {
    if (!item) return;
    setItem({ ...item, comments: text });
  }

  // Subir UNA foto y guardar URL en estado
  async function addPhoto(file: File) {
    if (!item) return;

    const form = new FormData();
    form.append("photo", file);

    const resp = await api.post(`/audit-items/${item.id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPhotos([resp.data.url]); // solo una foto
  }

  // 🔴 Botón FINAL: guarda todo + envía auditoría
  async function submitAudit() {
    if (!audit || !item) return;

    if (!item.result) {
      alert("Debes seleccionar un resultado (PASS / FAIL / NA).");
      return;
    }

    setLoading(true);
    try {
      // 1) Guardar último estado (incluye comentarios)
      await AuditService.updateItem(item.id, {
        result: item.result ?? "NA",
        comments: item.comments ?? "",
        defects: item.defects ?? "",
      });

      // 2) Enviar auditoría
      await AuditService.submitAudit(audit.id);

      alert("Auditoría enviada correctamente");
      history.push("/assignments");
    } catch (e) {
      console.error("Error al enviar auditoría", e);
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
