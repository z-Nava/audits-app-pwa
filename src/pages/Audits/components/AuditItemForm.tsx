import React, { useState } from "react";
import { IonItem, IonLabel, IonTextarea, IonButton } from "@ionic/react";

import AuditPhotos from "./AuditPhotos";
import {
  savePhotoOffline,
  registerSyncPhotos,
} from "../../../offline/offline-photos";
import api from "../../../services/api";
import { AuditItem } from "../../../types/audits";

interface Props {
  item: AuditItem;
  onChange?: (field: string, value: any) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

const AuditItemForm: React.FC<Props> = ({
  item,
  onChange,
  onSave,
  readOnly,
}) => {
  const [photos, setPhotos] = useState<{ url: string; synced: boolean }[]>([]);

  /** 📸 Handler de foto */
  const handleAddPhoto = async (file: File) => {
    console.log("🟦 [AuditItemForm] Foto seleccionada:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!item.id) {
      if (onSave) {
        await onSave();
      } else {
        console.warn("🟥 [AuditItemForm] No ID and no onSave");
        return;
      }
    }

    if (!item.id) return; // Still no ID?

    const online = navigator.onLine;
    const token = localStorage.getItem("token");

    // OPTIMISTIC UPDATE
    const localUrl = URL.createObjectURL(file);
    setPhotos([{ url: localUrl, synced: false }]); // Assuming single photo per item form based on existing logic

    if (!online) {
      await savePhotoOffline({
        audit_item_id: item.id!,
        file,
        name: file.name,
        type: file.type,
      });
      await registerSyncPhotos();
      console.log("🟨 [AuditItemForm] Foto offline registrada");
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await api.post(`/audit-items/${item.id}/photos`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      console.log(
        "🟩 [AuditItemForm] Respuesta API foto online:",
        res.status,
        res.data
      );
      setPhotos([{ url: res.data.url, synced: true }]);
    } catch (err) {
      console.error(
        "🟥 [AuditItemForm] Error subiendo foto ONLINE, fallback a offline:",
        err
      );
      // Fallback
      await savePhotoOffline({
        audit_item_id: item.id!,
        file,
        name: file.name,
        type: file.type,
      });
      await registerSyncPhotos();
      // Keep local preview, remains synced: false
    }
  };

  return (
    <div>
      {/* 📸 Sección de Fotos */}
      <AuditPhotos
        photos={photos}
        onAddPhoto={handleAddPhoto}
        readOnly={readOnly}
      />

      {/* Comentarios */}
      <IonItem lines="none">
        <IonLabel position="stacked">Comentarios</IonLabel>
      </IonItem>
      <IonTextarea
        value={item.comments ?? ""}
        disabled={readOnly}
        autoGrow
        onIonChange={(e) =>
          onChange && onChange("comments", e.detail.value || "")
        }
        className="mt-1"
      />

      {!readOnly && onSave && (
        <IonButton
          expand="block"
          className="mt-4 bg-primaryRed text-white font-bold rounded-xl"
          onClick={onSave}
        >
          Guardar resultado
        </IonButton>
      )}
    </div>
  );
};

export default AuditItemForm;
