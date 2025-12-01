// src/pages/Audits/components/AuditHeader.tsx

import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import { Audit } from "../../../types/audits";

interface Props {
  audit: Audit;
  readOnly?: boolean;
}

const AuditHeader: React.FC<Props> = ({ audit }) => {
  return (
    <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl shadow-md">
      <IonCardContent>
        <h2 className="font-bold text-lg mb-2">Auditoría</h2>

        <p className="text-sm mb-1">
          <span className="font-bold">Código:</span> {audit.audit_code}
        </p>
        <p className="text-sm mb-1">
          <span className="font-bold">Línea:</span> {audit.line.name}
        </p>
        <p className="text-sm mb-1">
          <span className="font-bold">Turno:</span> {audit.shift}
        </p>
        <p className="text-sm mb-1">
          <span className="font-bold">Supervisor:</span>{" "}
          {audit.supervisor.name}
        </p>
      </IonCardContent>
    </IonCard>
  );
};

export default AuditHeader;
