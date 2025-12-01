// src/pages/Audits/components/AuditPhotos.tsx

import React, { useRef } from "react";
import { IonButton } from "@ionic/react";

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
    <div>
      <h2 className="text-lg font-semibold mb-3">Fotografías</h2>

      {!readOnly && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />

          <IonButton
            expand="block"
            className="bg-primaryRed text-white font-bold rounded-xl mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Agregar foto
          </IonButton>
        </>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {photos.map((p, i) => (
            <img
              key={i}
              src={p}
              alt="audit"
              className="w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditPhotos;
