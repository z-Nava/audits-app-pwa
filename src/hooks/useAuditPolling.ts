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

        const currentMap = new Map<number, string>();
        currentData.forEach((a: any) => {
          currentMap.set(Number(a.id), a.status);
        });

        if (!firstLoadRef.current) {
          const newAssignments: any[] = [];
          const statusChangedAssignments: any[] = [];

          currentData.forEach((a: any) => {
            const id = Number(a.id);
            const status = a.status;

            if (!knownAuditsRef.current.has(id)) {
              newAssignments.push(a);
            } else {
              const oldStatus = knownAuditsRef.current.get(id);
              if (oldStatus !== status) {
                statusChangedAssignments.push({ ...a, oldStatus });
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
              let msg = `La asignación #${a.id} ha cambiado a: ${a.status}`;
              let header = "Actualización de Estado";

              if (a.status === "cancelled") {
                header = "Asignación Cancelada";
                msg = `La asignación #${a.id} ha sido CANCELADA.`;
              } else if (a.status === "completed") {
                header = "Asignación Completada";
                msg = `La asignación #${a.id} ha sido marcada como completada.`;
              } else if (a.status === "assigned") {
                header = "Re-asignación";
                msg = `La asignación #${a.id} ha sido re-asignada.`;
              }

              presentAlert({
                header: header,
                subHeader: `Asignación #${a.id}`,
                message: msg,
                buttons: ["Entendido"],
              });
            });
          }
        }

        knownAuditsRef.current = currentMap;
        firstLoadRef.current = false;
      } catch (error) {}
    };

    checkAudits();
    const intervalId = setInterval(checkAudits, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token]);
}

export default useAuditPolling;
