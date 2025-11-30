// src/pages/Audit/components/AuditToolCard.tsx

import React from "react";
import { IonCard, IonCardContent, IonButton } from "@ionic/react";
import { Tool } from "../../../types/audits";

interface Props {
  tool: Tool;
  itemExists: boolean;
  onCreateItem: () => void;
}

const AuditToolCard: React.FC<Props> = ({ tool, itemExists, onCreateItem }) => {
  return (
    <IonCard>
      <IonCardContent>
        <h2>{tool.name}</h2>
        <p><strong>Código:</strong> {tool.code}</p>
        <p><strong>Modelo:</strong> {tool.model ?? "N/A"}</p>

        {!itemExists && (
          <IonButton expand="block" onClick={onCreateItem}>
            Registrar resultado
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AuditToolCard;
