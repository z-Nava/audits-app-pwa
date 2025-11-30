import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
} from "@ionic/react";

import { constructOutline, timeOutline, eyeOutline, playOutline } from "ionicons/icons";
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
  const [assignments, setAssignments] = useState<AssignmentWithAudit[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchAssignments() {
    if (!user) return;
    setLoading(true);

    const resp = await api.get(`/assignments?technician_id=${user.id}`);
    const base = resp.data.data || resp.data;

    const withAudit = await Promise.all(
      base.map(async (a: Assignment) => {
        const audit = await AuditService.findByAssignment(a.id, user.id);
        return { ...a, audit };
      })
    );

    setAssignments(withAudit);
    setLoading(false);
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
    } catch (err) {
      alert("Error al iniciar auditoría");
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding">

        <h1 style={{ fontWeight: 700, marginBottom: "20px" }}>
          Mis Asignaciones
        </h1>

        {/* Loading / vacio */}
        {loading && <IonText>Cargando asignaciones...</IonText>}
        {!loading && assignments.length === 0 && (
          <IonText>No tienes asignaciones pendientes.</IonText>
        )}

        {/* Lista */}
        <IonList>
          {assignments.map((a) => (
            <IonCard key={a.id} style={{ borderRadius: "16px" }}>
              <IonCardContent>

                {/* TITULO */}
                <h2 style={{ fontSize: "20px", marginBottom: "6px" }}>
                  <IonIcon icon={constructOutline} style={{ marginRight: "6px" }} />
                  {a.line.name}
                </h2>

                {/* TURNO / NOTES */}
                <div style={{ marginBottom: "10px" }}>
                  <IonChip color="primary">
                    <IonIcon icon={timeOutline} />
                    <IonLabel>Turno {a.shift}</IonLabel>
                  </IonChip>

                  {a.notes && (
                    <p style={{ fontSize: "14px", marginTop: "4px", color: "#555" }}>
                      Nota: {a.notes}
                    </p>
                  )}
                </div>

                {/* ESTADO DEL AUDIT */}
                {a.audit?.status === "submitted" && (
                  <IonChip color="warning">
                    <IonLabel>En revisión</IonLabel>
                  </IonChip>
                )}

                {a.audit?.status === "reviewed" && (
                  <IonChip color="tertiary">
                    <IonLabel>Revisada (pendiente acciones)</IonLabel>
                  </IonChip>
                )}

                {a.audit?.status === "closed" && (
                  <IonChip color="success">
                    <IonLabel>Aprobada y cerrada</IonLabel>
                  </IonChip>
                )}

                {/* BOTONES */}
                <div style={{ marginTop: "14px", textAlign: "right" }}>
                  {a.audit ? (
                    <IonButton
                      size="small"
                      color="medium"
                      onClick={() => (window.location.href = `/audit/${a.audit.id}`)}
                    >
                      <IonIcon icon={eyeOutline} slot="start" />
                      Ver auditoría
                    </IonButton>
                  ) : (
                    a.status === "assigned" && (
                      <IonButton
                        size="small"
                        color="primary"
                        onClick={() => startAudit(a)}
                      >
                        <IonIcon icon={playOutline} slot="start" />
                        Iniciar
                      </IonButton>
                    )
                  )}
                </div>

              </IonCardContent>
            </IonCard>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
