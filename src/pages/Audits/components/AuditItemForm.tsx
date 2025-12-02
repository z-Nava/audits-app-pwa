// src/pages/Audits/components/AuditItemForm.tsx

import React from "react";
import { IonItem, IonLabel, IonTextarea, IonButton } from "@ionic/react";
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
  return (
    <div>
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
      
      {/* Botón guardar */}
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
