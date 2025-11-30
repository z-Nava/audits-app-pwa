// src/pages/Audits/components/AuditPhotos.tsx
import React, { useRef } from "react";
import { IonCard, IonCardContent, IonButton } from "@ionic/react";

interface Props {
  photos: string[];
  onAddPhoto?: (file: File) => Promise<void> | void;
  readOnly?: boolean;
}

const AuditPhotos: React.FC<Props> = ({ photos, onAddPhoto, readOnly }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onAddPhoto) onAddPhoto(file);
  }

  return (
    <IonCard>
      <IonCardContent>
        <h2>Fotografías</h2>

        {!readOnly && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileSelect}
            />

            <IonButton expand="block" onClick={() => fileInputRef.current?.click()}>
              Agregar foto
            </IonButton>
          </>
        )}

        {photos.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            {photos.map((p, i) => (
              <img
                key={i}
                src={p}
                alt="audit"
                style={{ width: "100%", marginBottom: "10px", borderRadius: "8px" }}
              />
            ))}
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AuditPhotos;
