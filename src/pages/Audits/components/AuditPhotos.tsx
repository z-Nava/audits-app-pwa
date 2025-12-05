// src/pages/Audits/components/AuditPhotos.tsx

import React, { useRef } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { cameraOutline } from "ionicons/icons";

interface AuditPhoto {
  url: string;
  synced: boolean;
}

interface Props {
  photos: AuditPhoto[];
  onAddPhoto?: (file: File) => Promise<void> | void;
  readOnly?: boolean;
}

const AuditPhotos: React.FC<Props> = ({ photos, onAddPhoto, readOnly }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onAddPhoto) onAddPhoto(file);
  }

  const photo = photos[0];
  const hasPhoto = !!photo;

  return (
    <div>
      <h3
        style={{
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.1rem",
          marginBottom: "12px",
        }}
      >
        Fotografía
      </h3>

      {!readOnly && !hasPhoto && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
          />
          <IonButton
            expand="block"
            fill="outline"
            shape="round"
            onClick={() => fileInputRef.current?.click()}
            style={{
              "--border-color": "#C8102E",
              "--color": "#C8102E",
              fontWeight: "bold",
              height: "48px",
              marginTop: "8px",
            }}
          >
            <IonIcon slot="start" icon={cameraOutline} />
            Tomar / Subir foto
          </IonButton>
        </>
      )}

      {hasPhoto && (
        <div style={{ position: "relative", marginTop: "12px" }}>
          <img
            src={photo.url}
            alt="Foto de auditoría"
            style={{
              width: "100%",
              borderRadius: "12px",
              objectFit: "cover",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          />

          {/* 🔥 Estado visual del archivo */}
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              background: photo.synced ? "#28a745" : "#ffc107",
              color: photo.synced ? "#fff" : "#000",
              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            }}
          >
            {photo.synced ? "Sincronizada ✔" : "Pendiente ⏳"}
          </span>
        </div>
      )}
    </div>
  );
};

export default AuditPhotos;
