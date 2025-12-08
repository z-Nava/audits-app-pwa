// src/pages/Audits/Audits.tsx

import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from "@ionic/react";

import {
  documentTextOutline,
  businessOutline,
  ribbonOutline,
  arrowForwardOutline,
  arrowBackOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const Audits: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await AuditService.list();
        setAudits(resp.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusChip = (status: string) => {
    const map: Record<
      string,
      { color: string; label: string; bg: string; text: string }
    > = {
      submitted: {
        color: "warning",
        label: "En revisión",
        bg: "#e0ac08",
        text: "#000",
      },
      reviewed: {
        color: "medium",
        label: "Revisada",
        bg: "#2dd36f",
        text: "#fff",
      },
      closed: {
        color: "success",
        label: "Cerrada",
        bg: "#92949c",
        text: "#fff",
      },
    };
    const data = map[status] || {
      color: "dark",
      label: status,
      bg: "#505050",
      text: "#fff",
    };

    return (
      <IonChip
        style={{
          background: data.bg,
          color: data.text,
          fontWeight: "bold",
          margin: 0,
          height: "24px",
          fontSize: "0.8rem",
        }}
      >
        <IonLabel>{data.label}</IonLabel>
      </IonChip>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          style={{
            minHeight: "100%",
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #4a0404 100%)",
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <IonButton
              fill="clear"
              color="light"
              onClick={() => history.push("/assignments")}
            >
              <IonIcon slot="start" icon={arrowBackOutline} />
              Atrás
            </IonButton>
          </div>
          <IonGrid fixed>
            <IonRow className="ion-margin-bottom">
              <IonCol>
                <IonText color="light">
                  <h1
                    style={{
                      fontWeight: "800",
                      fontSize: "2rem",
                      margin: 0,
                      letterSpacing: "1px",
                    }}
                  >
                    MIS AUDITORÍAS
                  </h1>
                  <p style={{ margin: 0, opacity: 0.7 }}>
                    Historial de evaluaciones
                  </p>
                </IonText>
              </IonCol>
            </IonRow>

            {loading && (
              <div className="ion-text-center ion-padding">
                <IonSpinner color="light" name="crescent" />
              </div>
            )}

            {!loading && audits.length === 0 && (
              <div className="ion-text-center ion-padding">
                <IonText color="light">
                  <p style={{ opacity: 0.8 }}>
                    No tienes auditorías asignadas.
                  </p>
                </IonText>
              </div>
            )}

            {!loading &&
              audits.map((a) => (
                <IonCard
                  key={a.id}
                  button
                  routerLink={`/audits/${a.id}`}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                    marginBottom: "16px",
                    marginInline: "0",
                  }}
                >
                  <IonCardContent>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(200, 16, 46, 0.2)",
                            padding: "8px",
                            borderRadius: "10px",
                            display: "flex",
                          }}
                        >
                          <IonIcon
                            icon={documentTextOutline}
                            style={{ color: "#C8102E", fontSize: "1.5rem" }}
                          />
                        </div>
                        <IonText color="light">
                          <h2
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                              fontSize: "1.2rem",
                            }}
                          >
                            {a.audit_code}
                          </h2>
                        </IonText>
                      </div>

                      {a.overall_result && (
                        <IonChip
                          style={{
                            background:
                              a.overall_result === "PASS"
                                ? "rgba(40, 167, 69, 0.2)"
                                : "rgba(220, 53, 69, 0.2)",
                            color:
                              a.overall_result === "PASS"
                                ? "#28a745"
                                : "#dc3545",
                            border: `1px solid ${
                              a.overall_result === "PASS"
                                ? "#28a745"
                                : "#dc3545"
                            }`,
                            fontWeight: "bold",
                            margin: 0,
                          }}
                        >
                          <IonIcon icon={ribbonOutline} />
                          <IonLabel>{a.overall_result}</IonLabel>
                        </IonChip>
                      )}
                    </div>

                    <div style={{ marginBottom: "12px", paddingLeft: "4px" }}>
                      <IonText
                        color="medium"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <IonIcon icon={businessOutline} />
                        {a.line?.name}
                      </IonText>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "16px",
                      }}
                    >
                      {statusChip(a.status)}

                      <IonIcon icon={arrowForwardOutline} color="medium" />
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Audits;
