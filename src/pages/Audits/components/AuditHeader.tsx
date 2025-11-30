// src/pages/Audit/components/AuditHeader.tsx

import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import { Audit } from "../../../types/audits";

interface Props {
  audit: Audit;
  readOnly?: boolean;
}

const AuditHeader: React.FC<Props> = ({ audit }) => {
  return (
    <IonCard>
      <IonCardContent>
        <h2 style={{ margin: 0 }}>Auditoría</h2>
        <p><strong>Código:</strong> {audit.audit_code}</p>
        <p><strong>Línea:</strong> {audit.line.name}</p>
        <p><strong>Turno:</strong> {audit.shift}</p>
        <p><strong>Supervisor:</strong> {audit.supervisor.name}</p>
      </IonCardContent>
    </IonCard>
  );
};

export default AuditHeader;
