// src/pages/Audit/components/AuditPhotos.tsx

import React from "react";
import { IonCard, IonCardContent, IonButton } from "@ionic/react";

interface Props {
  photos: string[];
  onAddPhoto: (file: File) => void;
}

const AuditPhotos: React.FC<Props> = ({ photos, onAddPhoto }) => {
  function handleFileSelect(e: any) {
    const file = e.target.files?.[0];
    if (file) onAddPhoto(file);
  }

  return (
    <IonCard>
      <IonCardContent>
        <h2>Fotografías</h2>

        {photos.length > 0 &&
          photos.map((p, i) => (
            <img
              key={i}
              src={p}
              alt="foto"
              style={{ width: "100%", marginBottom: "10px", borderRadius: "6px" }}
            />
          ))}

        <IonButton expand="block">
          <input
            type="file"
            accept="image/*"
            style={{ opacity: 0, position: "absolute", width: "100%", height: "100%" }}
            onChange={handleFileSelect}
          />
          Agregar Foto
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default AuditPhotos;
