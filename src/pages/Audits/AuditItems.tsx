// src/pages/Audits/AuditItems.tsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText
} from "@ionic/react";

import { constructOutline, clipboardOutline } from "ionicons/icons";
import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const AuditItems: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await AuditService.getAudit(Number(id));
        setAudit(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding flex justify-center items-center">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!audit) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">
            <h3>No se encontró la auditoría.</h3>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  const tools = audit.assignment?.tools ?? [];

  return (
    <IonPage>

      {/* HEADER */}
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Elementos a evaluar</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* TARJETA CON INFORMACIÓN GENERAL */}
        <IonCard style={{ borderRadius: "16px", marginBottom: "14px" }}>
          <IonCardContent>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <IonIcon icon={clipboardOutline} style={{ fontSize: "28px", marginRight: "10px", color: "#1e40af" }} />
              <h2 style={{ margin: 0, fontWeight: 700 }}>Auditoría {audit.audit_code}</h2>
            </div>

            <p style={{ margin: "4px 0", fontSize: "15px" }}>
              <strong>Línea:</strong> {audit.line.name}
            </p>

            <p style={{ margin: "4px 0", fontSize: "15px" }}>
              <strong>Turno:</strong> {audit.shift}
            </p>

            <p style={{ margin: "4px 0", fontSize: "15px" }}>
              <strong>Estado:</strong>{" "}
              <span style={{ textTransform: "uppercase" }}>{audit.status}</span>
            </p>

          </IonCardContent>
        </IonCard>

        {/* LISTA DE HERRAMIENTAS */}
        <h3 style={{ marginBottom: "10px", fontWeight: 600, fontSize: "18px" }}>
          Herramientas asociadas
        </h3>

        <IonList>
          {tools.length === 0 && (
            <IonText color="medium">
              <p>No hay herramientas asignadas a esta auditoría.</p>
            </IonText>
          )}

          {tools.map((tool: any) => (
            <IonItem
              key={tool.id}
              button
              routerLink={`/audits/${audit.id}/items/${tool.id}`}
              style={{ borderRadius: "12px", marginBottom: "8px" }}
            >
              <IonIcon
                icon={constructOutline}
                slot="start"
                style={{ fontSize: "24px", marginRight: "6px", color: "#3b82f6" }}
              />

              <IonLabel>
                <h2 style={{ margin: 0, fontWeight: 600 }}>{tool.name}</h2>
                <p style={{ margin: 0, fontSize: "14px" }}>{tool.code}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* BOTÓN ENVIAR */}
        <IonButton
          expand="block"
          style={{
            marginTop: "25px",
            height: "50px",
            borderRadius: "14px",
            fontWeight: 600,
          }}
          disabled={audit.status === "submitted"}
          color={audit.status === "submitted" ? "medium" : "success"}
        >
          Enviar auditoría
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default AuditItems;