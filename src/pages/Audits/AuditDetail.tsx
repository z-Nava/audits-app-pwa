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
  const { id } = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [item, setItem] = useState<AuditItem | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  async function loadAudit() {
    if (!id) return;

    setLoading(true);
    const data = await AuditService.getAudit(Number(id));
    setAudit(data);

    // Como SOLO hay una herramienta por asignación, revisamos si ya tiene item
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

    const url = resp.data.url; // tu API debería devolver la URL
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
            <AuditHeader audit={audit} />

            {/* TOOL */}
            <AuditToolCard
              tool={audit.assignment.tools![0]}
              itemExists={!!item}
              onCreateItem={createItem}
            />

            {/* FORMULARIO DEL ITEM */}
            {item && (
              <AuditItemForm
                item={item}
                onChange={(field, value) =>
                  setItem({ ...item, [field]: value })
                }
                onSave={saveItem}
              />
            )}

            {/* PHOTOS */}
            {item && (
              <AuditPhotos photos={photos} onAddPhoto={addPhoto} />
            )}

            {/* BOTÓN DE ENVIAR */}
            {item && (
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
