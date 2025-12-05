// src/pages/Assignments/Assignments.tsx

import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonChip,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from "@ionic/react";

import {
  constructOutline,
  timeOutline,
  eyeOutline,
  playOutline,
  logOutOutline,
  personCircleOutline,
  refreshOutline,
} from "ionicons/icons";

import api from "../../services/api";
import useUserStore from "../../store/userStore";
import { AuditService } from "../../services/AuditService";

interface Assignment {
  id: number;
  line: { id: number; name: string; code: string };
  shift: string;
  status: string;
  notes: string | null;
}

interface AssignmentWithAudit extends Assignment {
  audit?: any;
}

const Assignments: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.logout);

  const [assignments, setAssignments] = useState<AssignmentWithAudit[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchAssignments() {
    if (!user) return;

    setLoading(true);
    try {
      const resp = await api.get(`/assignments?technician_id=${user.id}`);
      const base = resp.data.data || resp.data;

      const withAudit = await Promise.all(
        base.map(async (a: Assignment) => {
          const audit = await AuditService.findByAssignment(a.id, user.id);
          return { ...a, audit };
        })
      );

      setAssignments(withAudit);
    } catch (error) {
      console.error("Error fetching assignments", error);
    } finally {
      setLoading(false);
    }
  }

  async function startAudit(a: Assignment) {
    if (!user) return;

    try {
      const resp = await api.post("/audits", {
        assignment_id: a.id,
        technician_id: user.id,
        employee_number: user.employee_number,
        shift: a.shift,
        summary: "",
      });

      window.location.href = `/audit/${resp.data.id}`;
    } catch {
      alert("Error al iniciar auditoría");
    }
  }

  function logout() {
    clearUser();
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

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
          <IonGrid fixed>
            {/* HEADER */}
            <IonRow className="ion-align-items-center ion-margin-bottom">
              <IonCol size="8">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <IonIcon
                    icon={personCircleOutline}
                    style={{ fontSize: "2.5rem", color: "#C8102E" }}
                  />
                  <div>
                    <IonText color="light">
                      <h2
                        style={{
                          margin: 0,
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        Hola, {user?.name.split(" ")[0]}
                      </h2>
                      <p
                        style={{ margin: 0, opacity: 0.7, fontSize: "0.9rem" }}
                      >
                        Técnico
                      </p>
                    </IonText>
                  </div>
                </div>
              </IonCol>
              <IonCol size="4" className="ion-text-end">
                <IonButton
                  fill="clear"
                  onClick={logout}
                  style={{ color: "#fff", "--ripple-color": "#C8102E" }}
                >
                  <IonIcon slot="icon-only" icon={logOutOutline} />
                </IonButton>
              </IonCol>
            </IonRow>

            {/* TITLE & REFRESH */}
            <IonRow className="ion-align-items-center ion-margin-bottom">
              <IonCol>
                <IonText color="light">
                  <h1
                    style={{
                      fontWeight: "800",
                      fontSize: "1.8rem",
                      margin: 0,
                      letterSpacing: "1px",
                    }}
                  >
                    MIS ASIGNACIONES
                  </h1>
                </IonText>
              </IonCol>
              <IonCol size="auto">
                <IonButton
                  size="small"
                  fill="outline"
                  shape="round"
                  onClick={fetchAssignments}
                  style={{
                    "--border-color": "rgba(255,255,255,0.3)",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                >
                  <IonIcon slot="start" icon={refreshOutline} />
                  Recargar
                </IonButton>
              </IonCol>
            </IonRow>

            {loading && (
              <div className="ion-text-center ion-padding">
                <IonText color="medium">Cargando asignaciones...</IonText>
              </div>
            )}

            {!loading && assignments.length === 0 && (
              <div className="ion-text-center ion-padding">
                <IonText color="medium">
                  No tienes asignaciones pendientes.
                </IonText>
              </div>
            )}

            {/* ASSIGNMENTS LIST */}
            {assignments.map((a) => (
              <IonCard
                key={a.id}
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
                      alignItems: "start",
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
                          borderRadius: "50%",
                          display: "flex",
                        }}
                      >
                        <IonIcon
                          icon={constructOutline}
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
                          {a.line.name}
                        </h2>
                        <p
                          style={{
                            margin: 0,
                            opacity: 0.6,
                            fontSize: "0.9rem",
                          }}
                        >
                          {a.line.code}
                        </p>
                      </IonText>
                    </div>

                    <IonChip
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        margin: 0,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <IonIcon icon={timeOutline} color="light" />
                      <IonLabel>Turno {a.shift}</IonLabel>
                    </IonChip>
                  </div>

                  {a.audit?.status && (
                    <div style={{ marginBottom: "12px" }}>
                      <IonChip
                        style={{
                          background:
                            a.audit.status === "in_progress"
                              ? "#e0ac08"
                              : a.audit.status === "submitted"
                              ? "#3dc2ff"
                              : a.audit.status === "reviewed"
                              ? "#2dd36f"
                              : "#92949c",
                          color: "#000",
                          fontWeight: "bold",
                          margin: 0,
                        }}
                      >
                        <IonLabel>
                          {a.audit.status.replace("_", " ").toUpperCase()}
                        </IonLabel>
                      </IonChip>
                    </div>
                  )}

                  {a.notes && (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        borderLeft: "3px solid #C8102E",
                      }}
                    >
                      <IonText color="medium" style={{ fontSize: "0.9rem" }}>
                        {a.notes}
                      </IonText>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "10px",
                    }}
                  >
                    {a.audit ? (
                      <IonButton
                        fill="solid"
                        shape="round"
                        onClick={() =>
                          (window.location.href = `/audit/${a.audit.id}`)
                        }
                        style={{
                          "--background": "#505050",
                          height: "40px",
                          fontWeight: "600",
                        }}
                      >
                        <IonIcon slot="start" icon={eyeOutline} />
                        Continuar
                      </IonButton>
                    ) : (
                      <IonButton
                        fill="solid"
                        shape="round"
                        onClick={() => startAudit(a)}
                        style={{
                          "--background":
                            "linear-gradient(90deg, #C8102E 0%, #9b0c23 100%)",
                          "--box-shadow": "0 4px 10px rgba(200, 16, 46, 0.3)",
                          height: "40px",
                          fontWeight: "600",
                        }}
                      >
                        <IonIcon slot="start" icon={playOutline} />
                        Iniciar
                      </IonButton>
                    )}
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

export default Assignments;
