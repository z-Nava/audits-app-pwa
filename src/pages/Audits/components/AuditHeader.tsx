// src/pages/Audits/components/AuditHeader.tsx

import React from "react";
import { IonCard, IonCardContent, IonButton, IonIcon } from "@ionic/react";
import { Audit } from "../../../types/audits";
import { arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";

interface Props {
  audit: Audit;
  readOnly?: boolean;
}

const AuditHeader: React.FC<Props> = ({ audit }) => {
  const history = useHistory();

  return (
    <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl shadow-md">
      <IonCardContent>

        {/* 🔥 Botón regresar */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Auditoría</h2>

          <IonButton
            size="small"
            fill="clear"
            onClick={() => history.goBack()}
            className="text-primaryRed"
          >
            <IonIcon icon={arrowBackOutline} className="text-xl" />
          </IonButton>
        </div>

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
