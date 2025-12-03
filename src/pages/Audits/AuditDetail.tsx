import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonText,
  IonButton,
  IonLoading,
  IonCard,
  IonCardContent,
  IonIcon,
} from "@ionic/react";

import { useParams } from "react-router-dom";
import { Audit, AuditItem } from "../../types/audits";
import { AuditService } from "../../services/AuditService";
import api from "../../services/api";

import AuditHeader from "./components/AuditHeader";
import AuditToolCard from "./components/AuditToolCard";
import AuditItemForm from "./components/AuditItemForm";
import AuditPhotos from "./components/AuditPhotos";

import { listCircleOutline, checkmarkDoneOutline } from "ionicons/icons";

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [item, setItem] = useState<AuditItem | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const readOnly = audit?.status !== "in_progress";

  async function loadAudit() {
    if (!id) return;

    setLoading(true);
    const data = await AuditService.getAudit(Number(id));
    setAudit(data);

    if (data.items && data.items.length > 0) {
      setItem(data.items[0]);
    }

    setLoading(false);
  }

  async function createItem() {
    if (!audit) return;

    const toolId = audit.assignment.tools![0].id;
    setLoading(true);

    // NO establecer PASS por defecto
    const newItem = await AuditService.createItem(audit.id, toolId);
    setItem(newItem);

    setLoading(false);
  }

  async function saveItem() {
    if (!item) return;
    setLoading(true);

    const updated = await AuditService.updateItem(item.id, {
      result: item.result,
      comments: item.comments ?? "",
      defects: item.defects ?? ""
    });

    setItem(updated);
    setLoading(false);
  }

  const setResult = (result: "PASS" | "FAIL" | "NA") => {
    if (!item || readOnly) return;

    // SOLO actualizar la UI, NO mandar a la API
    setItem(prev => ({ ...prev!, result }));
  };

  async function addPhoto(file: File) {
    if (!item) return;

    const form = new FormData();
    form.append("photo", file);

    const resp = await api.post(`/audit-items/${item.id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPhotos((prev) => [...prev, resp.data.url]);
  }

  async function submitAudit() {
    if (!audit) return;
    setLoading(true);

    await AuditService.submitAudit(audit.id);

    setLoading(false);
    alert("Auditoría enviada correctamente");
    window.location.href = "/assignments";
  }

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding bg-darkBg text-white font-poppins">
        <IonLoading isOpen={loading} message={"Cargando..."} />

        {!audit && <IonText>Cargando auditoría...</IonText>}

        {audit && (
          <>
            <AuditHeader audit={audit} readOnly={readOnly} />

            {/* HERRAMIENTA */}
            <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl mt-4 shadow-md">
              <IonCardContent>
                <div className="flex items-center gap-2 text-lg font-bold mb-4">
                  <IonIcon icon={listCircleOutline} className="text-primaryRed text-2xl" />
                  <span>Herramienta a Auditar</span>
                </div>

                <AuditToolCard
                  tool={audit.assignment.tools![0]}
                  itemExists={!!item}
                  onCreateItem={!readOnly ? createItem : undefined}
                  readOnly={readOnly}
                />
              </IonCardContent>
            </IonCard>

            {/* RESULTADO */}
            {item && (
              <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl mt-4 shadow-md">
                <IonCardContent>
                  <div className="flex items-center gap-2 text-lg font-bold mb-4">
                    <IonIcon icon={checkmarkDoneOutline} className="text-primaryRed text-3xl" />
                    <span>Resultado de Auditoría</span>
                  </div>

                  {/* BOTONES PASS / FAIL / NA */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                      className={`btn-result ${item.result === "PASS" ? "btn-pass-active" : "btn-pass"}`}
                      disabled={readOnly}
                      onClick={() => setResult("PASS")}
                    >
                      PASS
                    </button>

                    <button
                      className={`btn-result ${item.result === "FAIL" ? "btn-fail-active" : "btn-fail"}`}
                      disabled={readOnly}
                      onClick={() => setResult("FAIL")}
                    >
                      FAIL
                    </button>

                    <button
                      className={`btn-result ${item.result === "NA" ? "btn-na-active" : "btn-na"}`}
                      disabled={readOnly}
                      onClick={() => setResult("NA")}
                    >
                      N/A
                    </button>
                  </div>

                  {/* COMENTARIOS + GUARDAR */}
                  <AuditItemForm
                    item={item}
                    readOnly={readOnly}
                    onChange={
                      readOnly ? undefined : (field, value) =>
                        setItem({ ...item, [field]: value })
                    }
                    onSave={readOnly ? undefined : saveItem}
                  />
                </IonCardContent>
              </IonCard>
            )}

            {/* FOTOS */}
            {item && (
              <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl mt-4 shadow-md">
                <IonCardContent>
                  <AuditPhotos
                    photos={photos}
                    readOnly={readOnly}
                    onAddPhoto={readOnly ? undefined : addPhoto}
                  />
                </IonCardContent>
              </IonCard>
            )}

            {!readOnly && item && (
              <IonButton
                expand="block"
                className="bg-primaryRed mt-6 h-12 rounded-xl font-bold tracking-wide"
                onClick={submitAudit}
              >
                ENVIAR AUDITORÍA
              </IonButton>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AuditDetail;
