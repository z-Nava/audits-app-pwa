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

import api from "../../services/api"; // tu axios instance
import useUserStore from "../../store/userStore";

interface Assignment {
  id: number;
  line: { id: number; name: string; code: string };
  shift: string;
  status: string;
  notes: string | null;
}

const Assignments: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchAssignments() {
    if (!user) return;
    setLoading(true);

    const resp = await api.get(`/assignments?technician_id=${user.id}`);
    setAssignments(resp.data.data || resp.data);
    setLoading(false);
  }

  async function startAudit(a: Assignment) {
  if (!user) return;

  try {
    const resp = await api.post("/audits", {
      assignment_id: a.id,
      technician_id: user.id,
      employee_number: user.employee_number,
      shift: a.shift,   // ✔ AQUÍ LA SOLUCIÓN
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
                <p>Status: {a.status}</p>

                {a.notes && (
                <p style={{ fontStyle: "italic", color: "#999" }}>
                    Nota: {a.notes}
                </p>
                )}
            </IonLabel>

            {a.status === "assigned" && (
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
