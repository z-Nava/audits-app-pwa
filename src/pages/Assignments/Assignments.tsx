import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
} from "@ionic/react";

import api from "../../services/api";
import useUserStore from "../../store/userStore";
import { AuditService } from "../../services/AuditService"; // ✔ IMPORTADO

interface Assignment {
  id: number;
  line: { id: number; name: string; code: string };
  shift: string;
  status: string;
  notes: string | null;
}

interface AssignmentWithAudit extends Assignment {
  audit?: any; // ideal: audit?: Audit | null
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
        return { ...a, audit } as AssignmentWithAudit;
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

      const audit = resp.data;

      window.location.href = `/audit/${audit.id}`;
    } catch (err: any) {
      console.log("ERROR 422:", err.response?.data);
      alert("Error al iniciar auditoría");
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Mis Asignaciones</h2>

        {loading && <IonText>Cargando...</IonText>}

        {!loading && assignments.length === 0 && (
          <IonText>No tienes asignaciones pendientes.</IonText>
        )}

        <IonList>
          {assignments.map((a) => (
            <IonItem key={a.id}>
              <IonLabel>
                <h3>{a.line.name}</h3>
                <p>Shift: {a.shift}</p>

                {/* ESTADO DEL AUDIT */}
                {a.audit?.status === "submitted" && (
                  <p style={{ color: "orange" }}>
                    Auditoría enviada – en revisión
                  </p>
                )}

                {a.audit?.status === "reviewed" && (
                  <p style={{ color: "blue" }}>
                    Revisión completada (pendiente de acciones)
                  </p>
                )}

                {a.audit?.status === "closed" && (
                  <p style={{ color: "green" }}>
                    Auditoría aprobada y cerrada
                  </p>
                )}
              </IonLabel>

              {/* -------- BOTONES -------- */}

              {/* SI YA HAY AUDITORÍA */}
              {a.audit && (
                <IonButton
                  slot="end"
                  color="medium"
                  onClick={() =>
                    (window.location.href = `/audit/${a.audit.id}`)
                  }
                >
                  Ver auditoría
                </IonButton>
              )}

              {/* SI NO HAY AUDITORÍA Y ESTA ASSIGNMENT ESTÁ SIN INICIAR */}
              {!a.audit && a.status === "assigned" && (
                <IonButton slot="end" onClick={() => startAudit(a)}>
                  Iniciar
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
