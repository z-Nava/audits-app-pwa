// src/pages/Audits/components/AuditPhotos.tsx

import React, { useRef } from "react";
import { IonButton } from "@ionic/react";

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
      <h3 className="text-lg font-bold mb-2">Fotografía</h3>

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
            className="bg-primaryRed text-white font-bold rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            Tomar / Subir foto
          </IonButton>
        </>
      )}

      {hasPhoto && (
        <div className="relative mt-3">
          <img
            src={photo.url}
            alt="Foto de auditoría"
            className="w-full rounded-xl object-cover border border-gray-700 shadow"
          />

          {/* 🔥 Estado visual del archivo */}
          <span
            className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-lg font-bold
            ${photo.synced ? "bg-green-600 text-white" : "bg-yellow-500 text-black animate-pulse"}
          `}
          >
            {photo.synced ? "Sincronizada ✔" : "Pendiente ⏳"}
          </span>
        </div>
      )}
    </div>
  );
};

export default AuditPhotos;
