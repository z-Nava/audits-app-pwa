import React, { useState } from "react";
import {
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
} from "@ionic/react";

import AuditPhotos from "./AuditPhotos";
import { savePhotoOffline, registerSyncPhotos } from "../../../offline/offline-photos";
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
  console.log("🟦 [AuditItemForm] Estado online?:", navigator.onLine);
  console.log("🟦 [AuditItemForm] item.id actual:", item.id);

  // Si item.id no existe → forzar guardar primero
  if (!item.id) {
    console.log("🟧 [AuditItemForm] item.id vacío → llamando onSave() para obtener ID del backend");
    if (onSave) {
      await onSave();
      console.log("🟧 [AuditItemForm] onSave() terminado. item.id (OJO: este valor NO se actualiza solo aquí):", item.id);
    } else {
      console.warn("🟥 [AuditItemForm] No hay onSave definido, NO se puede garantizar audit_item_id");
    }
  }

  if (!item.id) {
    console.error("🟥 [AuditItemForm] item.id sigue undefined después de onSave → NO se guardará la foto");
    return;
  }

  console.log("🟩 [AuditItemForm] Usando audit_item_id:", item.id);

  const online = navigator.onLine;
  const token = localStorage.getItem("token");

  if (!online) {
    console.warn("🟨 [AuditItemForm] Offline → Guardando foto local en IndexedDB");
    await savePhotoOffline({
      audit_item_id: item.id!,
      file,
      name: file.name,
      type: file.type,
    });
    await registerSyncPhotos();
    setPhotos([{ url: URL.createObjectURL(file), synced: false }]);
    console.log("🟨 [AuditItemForm] Foto offline registrada y sync-photos solicitado");
    return;
  }

  // Online → POST directo
  try {
    console.log("🟦 [AuditItemForm] Online → intentando POST directo a API");
    const form = new FormData();
    form.append("file", file);

    const res = await api.post(`/audit-items/${item.id}/photos`, form, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    console.log("🟩 [AuditItemForm] Respuesta API foto online:", res.status, res.data);
    setPhotos([{ url: res.data.url, synced: true }]);
  } catch (err) {
    console.error("🟥 [AuditItemForm] Error subiendo foto ONLINE, fallback a offline:", err);
    await savePhotoOffline({
      audit_item_id: item.id!,
      file,
      name: file.name,
      type: file.type,
    });
    await registerSyncPhotos();
    setPhotos([{ url: URL.createObjectURL(file), synced: false }]);
  }
};


  return (
    <div>
      {/* 📸 Sección de Fotos */}
      <AuditPhotos photos={photos} onAddPhoto={handleAddPhoto} readOnly={readOnly} />

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
