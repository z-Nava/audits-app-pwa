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

import {
  constructOutline,
  timeOutline,
  eyeOutline,
  playOutline,
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
      <IonContent className="ion-padding bg-darkBg text-white font-poppins">
        <h1 className="text-2xl font-extrabold mb-5 uppercase tracking-wide text-primaryRed">
          Mis Asignaciones
        </h1>

        {/* Loading / Vacio */}
        {loading && <IonText>Cargando asignaciones...</IonText>}
        {!loading && assignments.length === 0 && (
          <IonText>No tienes asignaciones pendientes.</IonText>
        )}

        <IonList className="bg-transparent">
          {assignments.map((a) => (
            <IonCard
              key={a.id}
              className="bg-[#1A1A1A] rounded-2xl shadow-lg border border-primaryRed/30 mb-4"
            >
              <IonCardContent className="text-white">
                {/* Título */}
                <div className="flex items-center gap-2 mb-2">
                  <IonIcon icon={constructOutline} className="text-primaryRed text-xl" />
                  <h2 className="text-xl font-bold">{a.line.name}</h2>
                </div>

                {/* Turno y notas */}
                <div className="mb-3">
                  <IonChip
                    className="bg-primaryRed text-white font-semibold px-3 py-1 mr-2 rounded-full"
                  >
                    <IonIcon icon={timeOutline} className="mr-1" />
                    <IonLabel>Turno {a.shift}</IonLabel>
                  </IonChip>

                  {a.notes && (
                    <p className="text-sm text-gray-300 mt-1">
                      Nota: {a.notes}
                    </p>
                  )}
                </div>

                {/* Estado */}
                {a.audit?.status === "submitted" && (
                  <IonChip className="bg-yellow-500 text-black font-semibold px-3 py-1 rounded-full mb-3">
                    <IonLabel>En revisión</IonLabel>
                  </IonChip>
                )}

                {a.audit?.status === "reviewed" && (
                  <IonChip className="bg-blue-500 text-white font-semibold px-3 py-1 rounded-full mb-3">
                    <IonLabel>Revisada (pendiente acciones)</IonLabel>
                  </IonChip>
                )}

                {a.audit?.status === "closed" && (
                  <IonChip className="bg-green-600 text-white font-semibold px-3 py-1 rounded-full mb-3">
                    <IonLabel>Aprobada y cerrada</IonLabel>
                  </IonChip>
                )}

                {/* Botón */}
                <div className="flex justify-end mt-4">
                  {a.audit ? (
                    <IonButton
                      size="small"
                      className="bg-gray-500 text-white font-bold rounded-lg"
                      onClick={() => (window.location.href = `/audit/${a.audit.id}`)}
                    >
                      <IonIcon icon={eyeOutline} slot="start" />
                      Ver auditoría
                    </IonButton>
                  ) : (
                    a.status === "assigned" && (
                      <IonButton
                        size="small"
                        className="bg-primaryRed text-white font-bold rounded-lg"
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
