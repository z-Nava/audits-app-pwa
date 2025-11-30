// src/pages/Audit/components/AuditItemForm.tsx

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
  onChange: (field: string, value: any) => void;
  onSave: () => void;
}

const AuditItemForm: React.FC<Props> = ({ item, onChange, onSave }) => {
  return (
    <IonCard>
      <IonCardContent>
        <h2>Resultado</h2>

        <IonItem>
          <IonLabel>Resultado</IonLabel>
          <IonSelect
            value={item.result}
            onIonChange={(e) => onChange("result", e.detail.value)}
          >
            <IonSelectOption value="PASS">PASS</IonSelectOption>
            <IonSelectOption value="FAIL">FAIL</IonSelectOption>
            <IonSelectOption value="NA">N/A</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Comentarios */}
        <IonItem lines="none">
          <IonLabel position="stacked">Comentarios</IonLabel>
        </IonItem>

        <IonTextarea
          value={item.comments ?? ""}
          onIonChange={(e) => onChange("comments", e.detail.value)}
        />

        {/* Si FAIL → mostrar campo de defectos */}
        {item.result === "FAIL" && (
          <>
            <IonItem lines="none">
              <IonLabel position="stacked">Defectos</IonLabel>
            </IonItem>

            <IonTextarea
              value={item.defects ?? ""}
              onIonChange={(e) => onChange("defects", e.detail.value)}
            />
          </>
        )}

        <IonButton expand="block" style={{ marginTop: "15px" }} onClick={onSave}>
          Guardar Resultado
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default AuditItemForm;
