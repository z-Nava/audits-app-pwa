import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonLabel,
  IonButton,
  IonText,
  IonSpinner,
} from "@ionic/react";

import { documentTextOutline, ribbonOutline, businessOutline } from "ionicons/icons";
import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const Audits: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await AuditService.list();
        setAudits(resp.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function StatusChip(status: string) {
    if (status === "submitted")
      return <IonChip color="warning"><IonLabel>En revisión</IonLabel></IonChip>;

    if (status === "reviewed")
      return <IonChip color="tertiary"><IonLabel>Revisada</IonLabel></IonChip>;

    if (status === "closed")
      return <IonChip color="success"><IonLabel>Cerrada</IonLabel></IonChip>;

    return <IonChip color="medium"><IonLabel>{status}</IonLabel></IonChip>;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">

        <h1 style={{ fontWeight: 700, marginBottom: "20px" }}>
          Mis Auditorías
        </h1>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center mt-6">
            <IonSpinner name="crescent" />
          </div>
        )}

        {/* Si no hay auditorías */}
        {!loading && audits.length === 0 && (
          <IonText color="medium">
            <p style={{ textAlign: "center", marginTop: "30px" }}>
              No tienes auditorías registradas.
            </p>
          </IonText>
        )}

        {/* LISTA DE AUDITORÍAS */}
        {!loading &&
          audits.map((a) => (
            <IonCard
              key={a.id}
              button
              routerLink={`/audits/${a.id}`}
              style={{ borderRadius: "16px", marginBottom: "16px" }}
            >
              <IonCardContent>

                {/* CÓDIGO DE AUDITORÍA */}
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
                  <IonIcon icon={documentTextOutline} style={{ marginRight: "8px" }} />
                  {a.audit_code}
                </h2>

                {/* LÍNEA */}
                <p style={{ fontSize: "15px", marginBottom: "10px" }}>
                  <IonIcon
                    icon={businessOutline}
                    style={{ marginRight: "8px", opacity: 0.7 }}
                  />
                  {a.line?.name}
                </p>

                {/* ESTADO */}
                {StatusChip(a.status)}

                {/* RESULTADO */}
                {a.overall_result && (
                  <IonChip
                    color={a.overall_result === "PASS" ? "success" : "danger"}
                    style={{ marginLeft: "10px" }}
                  >
                    <IonIcon icon={ribbonOutline} />
                    <IonLabel>{a.overall_result}</IonLabel>
                  </IonChip>
                )}

              </IonCardContent>
            </IonCard>
          ))
        }

      </IonContent>
    </IonPage>
  );
};

export default Audits;
