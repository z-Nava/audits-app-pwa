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
          console.log("🔍 [Polling] Checking for new assignments...");
          console.log(
            "🔍 [Polling] Known IDs:",
            Array.from(knownAuditsRef.current)
          );
          console.log("🔍 [Polling] Current IDs:", Array.from(currentIds));

          const newAssignments = currentData.filter(
            (a: any) => !knownAuditsRef.current.has(Number(a.id))
          );

          if (newAssignments.length > 0) {
            console.log(
              "🔔 [Polling] New assignments found:",
              newAssignments.length
            );
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
          } else {
            console.log("🔍 [Polling] No new assignments.");
          }
        } else {
          console.log(
            "🔍 [Polling] First load - initializing known IDs:",
            Array.from(currentIds)
          );
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
