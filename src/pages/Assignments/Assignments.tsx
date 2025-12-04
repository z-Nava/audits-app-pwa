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
} from "@ionic/react";

import {
  constructOutline,
  timeOutline,
  eyeOutline,
  playOutline,
  logOutOutline,
  personCircleOutline,
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
      <IonContent className="ion-padding bg-darkBg text-white font-poppins">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <IonIcon icon={personCircleOutline} className="text-primaryRed text-3xl" />
            <h1 className="text-xl font-bold">
              Hola, {user?.name.split(" ")[0]}
            </h1>
          </div>

          <IonButton
            size="small"
            fill="clear"
            onClick={logout}
            className="text-red-500"
          >
            <IonIcon icon={logOutOutline} className="text-2xl" />
          </IonButton>
        </div>

        <div className="flex items-center justify-between mb-3">
  <h2 className="text-lg font-extrabold uppercase tracking-wide text-primaryRed">
    Mis Asignaciones
  </h2>

  <IonButton
    fill="clear"
    className="text-white bg-gray-700 hover:bg-gray-600 rounded-full px-3 py-1 
               transition-all flex items-center gap-2 shadow-md"
    onClick={fetchAssignments}
    color="medium"
  >
    <IonIcon className="text-lg" />
    Recargar
  </IonButton>
</div>


        {loading && <IonText>Cargando...</IonText>}
        {!loading && assignments.length === 0 && (
          <IonText>No tienes asignaciones pendientes.</IonText>
        )}

        {/* ASSIGNMENTS GRID */}
        <IonList className="bg-transparent space-y-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-[#111] border border-primaryRed/30 rounded-2xl p-4 
                        shadow-md hover:shadow-primaryRed/20 transition-all w-full"
            >
              {/* Header herramienta */}
              <div className="flex items-center gap-2 mb-3">
                <IonIcon icon={constructOutline} className="text-primaryRed text-2xl" />
                <h2 className="font-bold text-lg">{a.line.name}</h2>
              </div>

              {/* Turno y estado */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <IonChip className="bg-primaryRed text-white font-semibold px-3 rounded-full">
                  <IonIcon icon={timeOutline} className="mr-1" />
                  <IonLabel>Turno {a.shift}</IonLabel>
                </IonChip>

                {a.audit?.status && (
                  <IonChip
                    className={`font-semibold px-3 rounded-full 
                      ${
                        a.audit.status === "in_progress" && "bg-yellow-500 text-black"
                      }
                      ${
                        a.audit.status === "submitted" && "bg-blue-500 text-white"
                      }
                      ${
                        a.audit.status === "reviewed" && "bg-green-600 text-white"
                      }
                      ${
                        a.audit.status === "closed" && "bg-gray-500 text-white"
                      }
                    `}
                  >
                    {a.audit.status.replace("_", " ").toUpperCase()}
                  </IonChip>
                )}
              </div>

              {/* Notas */}
              {a.notes && (
                <div className="bg-black/40 border border-primaryRed/20 rounded-lg px-3 py-2 mb-3">
                  <p className="text-gray-300 text-sm leading-snug">
                    📝 {a.notes}
                  </p>
                </div>
              )}

              {/* Botón */}
             <div className="w-full flex justify-end mt-4">
                {a.audit ? (
                  <IonButton
                    fill="solid"
                    className="bg-gray-700 hover:bg-gray-600 transition-all
                              text-white font-bold rounded-full px-4 py-2
                              flex items-center gap-2 shadow-md"
                    onClick={() => (window.location.href = `/audit/${a.audit.id}`)}
                  >
                    <IonIcon icon={eyeOutline} className="text-lg" />
                    Continuar
                  </IonButton>
                ) : (
                  <IonButton
                    fill="solid"
                    className="bg-primaryRed hover:bg-red-600 transition-all
                              text-white font-bold rounded-full px-4 py-2
                              flex items-center gap-2 shadow-md"
                    onClick={() => startAudit(a)}
                  >
                    <IonIcon icon={playOutline} className="text-lg" />
                    Iniciar
                  </IonButton>
                )}
              </div>

            </div>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
