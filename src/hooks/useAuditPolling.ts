import { useEffect, useRef } from "react";
import { useIonAlert } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { AuditService } from "../services/AuditService";
import useUserStore from "../store/userStore";

const POLLING_INTERVAL = 5000; // 5 segundos

export function useAuditPolling() {
  const [presentAlert] = useIonAlert();
  const history = useHistory();
  const token = useUserStore((s) => s.token);
  const knownAuditsRef = useRef<Map<number, string>>(new Map());
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (!token) return;

    const checkAudits = async () => {
      try {
        const user = useUserStore.getState().user;
        if (!user?.id) return;
        const currentData = await AuditService.getAssignments(user.id);
        const assignmentsWithAudit = await Promise.all(
          currentData.map(async (a: any) => {
            try {
              const audit = await AuditService.findByAssignment(a.id, user.id);
              return { ...a, audit };
            } catch (error) {
              return { ...a, audit: null };
            }
          })
        );

        const currentMap = new Map<number, string>();
        assignmentsWithAudit.forEach((a: any) => {
          const status = a.audit ? a.audit.status : "pending";
          currentMap.set(Number(a.id), status);
        });

        if (!firstLoadRef.current) {
          const newAssignments: any[] = [];
          const statusChangedAssignments: any[] = [];

          assignmentsWithAudit.forEach((a: any) => {
            const id = Number(a.id);
            const status = a.audit ? a.audit.status : "pending";

            if (!knownAuditsRef.current.has(id)) {
              newAssignments.push(a);
            } else {
              const oldStatus = knownAuditsRef.current.get(id);
              if (oldStatus !== status) {
                statusChangedAssignments.push({ ...a, status, oldStatus });
              }
            }
          });

          if (newAssignments.length > 0) {
            presentAlert({
              header: "Nueva Asignación",
              subHeader: "Tienes asignaciones pendientes",
              message: `Tienes ${newAssignments.length} nueva(s) asignación(es).`,
              buttons: [
                {
                  text: "Ok",
                  role: "ok",
                },
                {
                  text: "Ver Asignaciones",
                  role: "cancel",
                  handler: () => {
                    history.push("/assignments");
                  },
                },
              ],
            });
          }

          if (statusChangedAssignments.length > 0) {
            statusChangedAssignments.forEach((a) => {
              const status = a.status;
              const name = a.line ? a.line.name : `Asignación ${a.id}`;

              let header = "Actualización de Estado";
              let msg = `La asignación de ${name} ha cambiado a: ${status}`;
              let buttons = ["Entendido"];

              switch (status) {
                case "reviewed":
                  header = "Auditoría Revisada";
                  msg = `La auditoría de ${name} ha sido REVISADA por el supervisor.`;
                  break;
                case "submitted":
                  header = "Auditoría Enviada";
                  msg = `La auditoría de ${name} ha sido ENVIADA correctamente.`;
                  break;
                case "in_progress":
                  header = "En Progreso";
                  msg = `La auditoría de ${name} está en curso.`;
                  break;
                case "pending":
                  msg = `La auditoría de ${name} está pendiente de inicio.`;
                  break;
              }

              presentAlert({
                header,
                subHeader: name,
                message: msg,
                buttons,
              });
            });
          }
        }

        knownAuditsRef.current = currentMap;
        firstLoadRef.current = false;
      } catch (error) {
        // silent error
      }
    };
    checkAudits();
    const intervalId = setInterval(checkAudits, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token]);
}

export default useAuditPolling;
