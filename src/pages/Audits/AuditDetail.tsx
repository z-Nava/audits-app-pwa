import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonText,
  IonButton,
  IonLoading,
} from "@ionic/react";

import { useParams } from "react-router-dom";

import { Audit, AuditItem } from "../../types/audits";
import { AuditService } from "../../services/AuditService";
import api from "../../services/api";

import AuditHeader from "./components/AuditHeader";
import AuditToolCard from "./components/AuditToolCard";
import AuditItemForm from "./components/AuditItemForm";
import AuditPhotos from "./components/AuditPhotos";

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [item, setItem] = useState<AuditItem | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isReadOnly = audit?.status !== "in_progress";

  async function loadAudit() {
    if (!id) return;

    setLoading(true);
    const data = await AuditService.getAudit(Number(id));
    setAudit(data);

    // Si ya tiene item
    if (data.items && data.items.length > 0) {
      const i = data.items[0];
      setItem(i);

      // cargar las fotos
      const resp = await api.get(`/audit-items/${i.id}/photos`);
      setPhotos(resp.data.map((p: any) => p.url));
    }

    setLoading(false);
  }

  async function createItem() {
    if (!audit || isReadOnly) return;

    const toolId = audit.assignment.tools![0].id;
    const newItem = await AuditService.createItem(audit.id, toolId);
    setItem(newItem);
  }

  async function saveItem() {
    if (!item || isReadOnly) return;

    setLoading(true);
    const updated = await AuditService.updateItem(item.id, item);
    setItem(updated);
    setLoading(false);
  }

  async function addPhoto(file: File) {
    if (!item || isReadOnly) return;

    const form = new FormData();
    form.append("photo", file);

    const resp = await api.post(`/audit-items/${item.id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setPhotos([...photos, resp.data.url]);
  }

  async function submitAudit() {
    if (!audit || isReadOnly) return;

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
            {/* Header con datos del audit */}
            <AuditHeader audit={audit} />

            {/* Tarjeta de herramienta */}
            <AuditToolCard
              tool={audit.assignment.tools![0]}
              itemExists={!!item}
              onCreateItem={!isReadOnly ? createItem : undefined}
              readOnly={isReadOnly}
            />

            {/* Si el audit YA está enviado → mostrar mensaje */}
            {isReadOnly && (
              <IonText color="medium">
                <p style={{ fontStyle: "italic", marginTop: "10px" }}>
                  Esta auditoría fue enviada y está en estado: <strong>{audit.status}</strong>
                </p>
              </IonText>
            )}

            {/* Formulario del ítem */}
            {item && (
              <AuditItemForm
                item={item}
                readOnly={isReadOnly}
                onChange={
                  !isReadOnly
                    ? (field, value) => setItem({ ...item, [field]: value })
                    : undefined
                }
                onSave={!isReadOnly ? saveItem : undefined}
              />
            )}

            {/* Fotos */}
            {item && (
              <AuditPhotos
                photos={photos}
                onAddPhoto={!isReadOnly ? addPhoto : undefined}
                readOnly={isReadOnly}
              />
            )}

            {/* Botón enviar → solo si puede */}
            {!isReadOnly && item && (
              <IonButton
                expand="block"
                color="success"
                onClick={submitAudit}
                style={{ marginTop: "20px" }}
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
