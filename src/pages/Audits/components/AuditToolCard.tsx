// src/pages/Audits/components/AuditToolCard.tsx
import React from "react";
import { IonCard, IonCardContent, IonButton } from "@ionic/react";
import { Tool } from "../../../types/audits";

interface Props {
  tool: Tool;
  itemExists: boolean;
  onCreateItem?: () => Promise<void> | void;
  readOnly?: boolean;
}

const AuditToolCard: React.FC<Props> = ({ tool, itemExists, onCreateItem, readOnly }) => {
  return (
    <IonCard>
      <IonCardContent>
        <h2>{tool.name}</h2>
        <p><strong>Código:</strong> {tool.code}</p>
        {tool.model && <p><strong>Modelo:</strong> {tool.model}</p>}

        {!readOnly && !itemExists && (
          <IonButton expand="block" onClick={() => onCreateItem && onCreateItem()}>
            Registrar resultado
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AuditToolCard;
