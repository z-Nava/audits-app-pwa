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

  const hasPhoto = photos.length > 0;

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Fotografía</h3>

      {!readOnly && !hasPhoto && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            // Sugerir cámara trasera en móviles
            capture="environment"
            onChange={handleFileSelect}
          />
          <IonButton
            expand="block"
            className="bg-primaryRed text-white font-bold rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            Tomar / Subir foto
          </IonButton>
        </>
      )}

      {hasPhoto && (
        <img
          src={photos[0]}
          alt="Foto de auditoría"
          className="w-full rounded-xl mt-3 object-cover border border-gray-700"
        />
      )}
    </div>
  );
};

export default AuditPhotos;
