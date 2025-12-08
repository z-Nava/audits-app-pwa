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
  const knownAuditsRef = useRef<Set<number>>(new Set());
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (!token) return;

    const checkAudits = async () => {
      try {
        const user = useUserStore.getState().user;
        if (!user?.id) return;

        const currentData = await AuditService.getAssignments(user.id);
        const currentIds = new Set<number>(
          currentData.map((a: any) => Number(a.id))
        );

        if (!firstLoadRef.current) {
          const newAssignments = currentData.filter(
            (a: any) => !knownAuditsRef.current.has(Number(a.id))
          );

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
        }

        knownAuditsRef.current = currentIds;
        firstLoadRef.current = false;
      } catch (error) {
        console.error("Error polling assignments:", error);
      }
    };

    checkAudits();
    const intervalId = setInterval(checkAudits, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token]);
}

export default useAuditPolling;
