// src/pages/Audits/components/AuditToolCard.tsx

import React from "react";
import { IonButton } from "@ionic/react";
import { Tool } from "../../../types/audits";

interface Props {
  tool: Tool;
  itemExists: boolean;
  onCreateItem?: () => Promise<void> | void;
  readOnly?: boolean;
}

const AuditToolCard: React.FC<Props> = ({
  tool,
  itemExists,
  onCreateItem,
  readOnly,
}) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold mb-1">{tool.name}</h3>
      <p className="text-sm">
        <span className="font-bold">Código:</span> {tool.code}
      </p>
      {tool.model && (
        <p className="text-sm">
          <span className="font-bold">Modelo:</span> {tool.model}
        </p>
      )}

      {!readOnly && !itemExists && (
        <IonButton
          expand="block"
          className="mt-3 bg-primaryRed text-white font-bold rounded-xl"
          onClick={() => onCreateItem && onCreateItem()}
        >
          Registrar resultado
        </IonButton>
      )}
    </div>
  );
};

export default AuditToolCard;
