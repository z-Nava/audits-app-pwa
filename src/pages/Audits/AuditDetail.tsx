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

    const newItem = await AuditService.createItem(audit.id, toolId);
    setItem(newItem);
  }

  async function saveItem() {
    if (!item) return;
    setLoading(true);

    const updated = await AuditService.updateItem(item.id, item);
    setItem(updated);

    setLoading(false);
  }

  async function addPhoto(file: File) {
    if (!item) return;

    const form = new FormData();
    form.append("photo", file);

    const resp = await api.post(`/audit-items/${item.id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const url = resp.data.url;
    setPhotos([...photos, url]);
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
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message={"Cargando..."} />

        {!audit && <IonText>Cargando...</IonText>}

        {audit && (
          <>
            {/* HEADER */}
            <AuditHeader audit={audit} readOnly={readOnly} />

            {/* SECCIÓN: HERRAMIENTA */}
            <IonCard style={{ marginTop: "10px", borderRadius: "16px" }}>
              <IonCardContent>
                <h2 style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <IonIcon icon={listCircleOutline} style={{ fontSize: "24px", marginRight: "8px" }} />
                  Herramienta a Auditar
                </h2>

                <AuditToolCard
                  tool={audit.assignment.tools![0]}
                  itemExists={!!item}
                  onCreateItem={!readOnly ? createItem : undefined}
                  readOnly={readOnly}
                />
              </IonCardContent>
            </IonCard>

            {/* SECCIÓN: FORMULARIO DEL ITEM */}
            {item && (
              <IonCard style={{ marginTop: "15px", borderRadius: "16px" }}>
                <IonCardContent>
                  <h2 style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                    <IonIcon icon={checkmarkDoneOutline} style={{ fontSize: "26px", marginRight: "8px" }} />
                    Resultado de Auditoría
                  </h2>

                  <AuditItemForm
                    item={item}
                    onChange={readOnly ? () => {} : (f, v) => setItem({ ...item, [f]: v })}
                    onSave={readOnly ? undefined : saveItem}
                    readOnly={readOnly}
                  />
                </IonCardContent>
              </IonCard>
            )}

            {/* SECCIÓN: FOTOS */}
            {item && (
              <IonCard style={{ marginTop: "15px", borderRadius: "16px" }}>
                <IonCardContent>
                  <AuditPhotos
                    photos={photos}
                    onAddPhoto={readOnly ? undefined : addPhoto}
                    readOnly={readOnly}
                  />
                </IonCardContent>
              </IonCard>
            )}

            {/* BOTÓN ENVIAR */}
            {!readOnly && item && (
              <IonButton
                expand="block"
                color="success"
                onClick={submitAudit}
                style={{
                  marginTop: "20px",
                  height: "50px",
                  borderRadius: "14px",
                  fontWeight: 600,
                }}
              >
                ENVIAR AUDITORÍA
              </IonButton>
            )}

            {/* ESTADO READ ONLY */}
            {readOnly && (
              <IonText color="medium">
                <p
                  style={{
                    marginTop: "24px",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  Auditoría en estado:{" "}
                  <strong style={{ textTransform: "uppercase" }}>{audit.status}</strong>
                </p>
              </IonText>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AuditDetail;
