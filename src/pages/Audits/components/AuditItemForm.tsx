// src/pages/Audits/components/AuditItemForm.tsx

import React from "react";
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
} from "@ionic/react";

import { AuditItem } from "../../../types/audits";

interface Props {
  item: AuditItem;
  onChange?: (field: string, value: any) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

const AuditItemForm: React.FC<Props> = ({ item, onChange, onSave, readOnly }) => {
  return (
    <IonCard>
      <IonCardContent>
        <h2>Resultado</h2>

        {/* RESULT */}
        <IonItem>
          <IonLabel>Resultado</IonLabel>

          <IonSelect
            value={item.result}
            disabled={readOnly}
            onIonChange={(e) => onChange && onChange("result", e.detail.value)}
          >
            <IonSelectOption value="PASS">PASS</IonSelectOption>
            <IonSelectOption value="FAIL">FAIL</IonSelectOption>
            <IonSelectOption value="NA">N/A</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* COMENTARIOS */}
        <IonItem lines="none">
          <IonLabel position="stacked">Comentarios</IonLabel>
        </IonItem>

        <IonTextarea
          value={item.comments ?? ""}
          disabled={readOnly}
          autoGrow
          onIonChange={(e) => onChange && onChange("comments", e.detail.value)}
        />

        {/* DEFECTOS (solo si FAIL) */}
        {item.result === "FAIL" && (
          <>
            <IonItem lines="none" style={{ marginTop: "12px" }}>
              <IonLabel position="stacked">Defectos</IonLabel>
            </IonItem>

            <IonTextarea
              value={item.defects ?? ""}
              disabled={readOnly}
              autoGrow
              onIonChange={(e) => onChange && onChange("defects", e.detail.value)}
            />
          </>
        )}

        {/* BOTÓN GUARDAR */}
        {!readOnly && onSave && (
          <IonButton
            expand="block"
            style={{ marginTop: "15px" }}
            onClick={onSave}
          >
            Guardar Resultado
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AuditItemForm;
