// src/pages/Audits/components/AuditHeader.tsx

import React from "react";
import { IonCard, IonCardContent, IonButton, IonIcon } from "@ionic/react";
import { Audit } from "../../../types/audits";
import { arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";

interface Props {
  audit: Audit;
}

const AuditHeader: React.FC<Props> = ({ audit }) => {
  const history = useHistory();
  const tool = audit.assignment.tools?.[0];

  return (
    <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl shadow-md">
      <IonCardContent className="space-y-3">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-bold text-lg">Auditoría</h2>

          <IonButton
            size="small"
            fill="clear"
            className="text-primaryRed"
            onClick={() => history.goBack()}
          >
            <IonIcon icon={arrowBackOutline} className="text-xl" />
          </IonButton>
        </div>

        {/* Datos de la auditoría */}
        <p className="text-sm">
          <span className="font-bold">Código:</span> {audit.audit_code}
        </p>
        <p className="text-sm">
          <span className="font-bold">Línea:</span> {audit.line.name}
        </p>
        <p className="text-sm">
          <span className="font-bold">Turno:</span> {audit.shift}
        </p>
        <p className="text-sm">
          <span className="font-bold">Supervisor:</span>{" "}
          {audit.supervisor.name}
        </p>

        {/* Separador */}
        <div className="border-l-2 border-primaryRed h-6 my-2" />

        {/* Herramienta */}
        {tool && (
          <>
            <h3 className="font-bold text-lg">Herramienta</h3>
            <p className="text-sm">
              <span className="font-bold">Nombre:</span> {tool.name}
            </p>
            <p className="text-sm">
              <span className="font-bold">Código:</span> {tool.code}
            </p>
            {tool.model && (
              <p className="text-sm">
                <span className="font-bold">Modelo:</span> {tool.model}
              </p>
            )}
          </>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AuditHeader;
