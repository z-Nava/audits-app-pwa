// src/pages/Audits/AuditItems.tsx

import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { arrowBackOutline, playOutline } from "ionicons/icons";
import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const AuditItems: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await AuditService.getAudit(Number(id));
      setAudit(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div
            style={{
              minHeight: "100%",
              background:
                "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #4a0404 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IonSpinner name="crescent" color="light" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!audit) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div
            style={{
              minHeight: "100%",
              background:
                "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #4a0404 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IonText color="danger">
              <h2 style={{ fontWeight: "bold" }}>Auditoría no encontrada.</h2>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ "--background": "#000", "--color": "#fff" }}>
          <IonButton fill="clear" slot="start" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} color="light" />
          </IonButton>
          <IonTitle style={{ fontWeight: "bold", letterSpacing: "1px" }}>
            Detalle de Auditoría
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          style={{
            minHeight: "100%",
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #4a0404 100%)",
            padding: "20px",
          }}
        >
          <IonGrid fixed>
            <IonCard
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              <IonCardContent>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h2
                    style={{
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: "1.8rem",
                      margin: 0,
                    }}
                  >
                    {audit.audit_code}
                  </h2>
                  <p style={{ color: "#aaa", margin: "5px 0 0" }}>
                    Resumen General
                  </p>
                </div>

                <div style={{ display: "grid", gap: "12px", color: "#fff" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      paddingBottom: "8px",
                    }}
                  >
                    <span style={{ opacity: 0.7 }}>Línea:</span>
                    <span style={{ fontWeight: "bold" }}>
                      {audit.line.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      paddingBottom: "8px",
                    }}
                  >
                    <span style={{ opacity: 0.7 }}>Turno:</span>
                    <span style={{ fontWeight: "bold" }}>{audit.shift}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      paddingBottom: "8px",
                    }}
                  >
                    <span style={{ opacity: 0.7 }}>Estado:</span>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#C8102E",
                        textTransform: "uppercase",
                      }}
                    >
                      {audit.status}
                    </span>
                  </div>
                </div>

                <IonButton
                  expand="block"
                  shape="round"
                  className="ion-margin-top"
                  onClick={() => history.push(`/audits/${audit.id}`)}
                  style={{
                    "--background":
                      "linear-gradient(90deg, #C8102E 0%, #9b0c23 100%)",
                    "--box-shadow": "0 4px 15px rgba(200, 16, 46, 0.4)",
                    fontWeight: "bold",
                    height: "48px",
                    marginTop: "24px",
                  }}
                >
                  <IonIcon slot="start" icon={playOutline} />
                  Entrar a evaluación
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuditItems;
