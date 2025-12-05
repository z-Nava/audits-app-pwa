// src/pages/Audits/components/AuditHeader.tsx

import React from "react";
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
} from "@ionic/react";
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
    <IonCard
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
        marginInline: "0",
      }}
    >
      <IonCardContent>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1.2rem",
              margin: 0,
            }}
          >
            Auditoría
          </h2>

          <IonButton
            size="small"
            fill="clear"
            onClick={() => history.goBack()}
            style={{
              "--background": "transparent",
              color: "#fff",
              margin: 0,
            }}
          >
            <IonIcon icon={arrowBackOutline} style={{ fontSize: "1.5rem" }} />
          </IonButton>
        </div>

        {/* Datos de la auditoría */}
        <div
          style={{
            display: "grid",
            gap: "8px",
            color: "#fff",
            fontSize: "0.9rem",
          }}
        >
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: "bold", opacity: 0.7 }}>Código:</span>{" "}
            {audit.audit_code}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: "bold", opacity: 0.7 }}>Línea:</span>{" "}
            {audit.line.name}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: "bold", opacity: 0.7 }}>Turno:</span>{" "}
            {audit.shift}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: "bold", opacity: 0.7 }}>
              Supervisor:
            </span>{" "}
            {audit.supervisor.name}
          </p>
        </div>

        {/* Separador */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.1)",
            margin: "16px 0",
          }}
        />

        {/* Herramienta */}
        {tool && (
          <>
            <h3
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.1rem",
                marginBottom: "8px",
              }}
            >
              Herramienta
            </h3>
            <div
              style={{
                display: "grid",
                gap: "8px",
                color: "#fff",
                fontSize: "0.9rem",
              }}
            >
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "bold", opacity: 0.7 }}>
                  Nombre:
                </span>{" "}
                {tool.name}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: "bold", opacity: 0.7 }}>
                  Código:
                </span>{" "}
                {tool.code}
              </p>
              {tool.model && (
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: "bold", opacity: 0.7 }}>
                    Modelo:
                  </span>{" "}
                  {tool.model}
                </p>
              )}
            </div>
          </>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default AuditHeader;
