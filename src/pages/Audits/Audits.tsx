// src/pages/Audits/Audits.tsx

import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonText,
} from "@ionic/react";

import {
  documentTextOutline,
  businessOutline,
  ribbonOutline,
} from "ionicons/icons";
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

  const statusChip = (status: string) => {
    const map: Record<
      string,
      { color: string; label: string }
    > = {
      submitted: { color: "warning", label: "En revisión" },
      reviewed: { color: "medium", label: "Revisada" },
      closed: { color: "success", label: "Cerrada" },
    };
    const data = map[status] || { color: "dark", label: status };

    return (
      <IonChip className="chip-status" color={data.color}>
        <IonLabel>{data.label}</IonLabel>
      </IonChip>
    );
  };

  return (
    <IonPage>
      <IonContent className="audits-bg ion-padding">
        <h1 className="title-primary">Mis Auditorías</h1>

        {loading && (
          <div className="center mt-6">
            <IonSpinner color="light" name="crescent" />
          </div>
        )}

        {!loading && audits.length === 0 && (
          <IonText color="light">
            <p className="center mt-6 opacity-80">
              No tienes auditorías asignadas.
            </p>
          </IonText>
        )}

        {!loading &&
          audits.map((a) => (
            <IonCard
              key={a.id}
              button
              routerLink={`/audits/${a.id}`}
              className="card-audit"
            >
              <IonCardContent>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="audit-title flex items-center">
                    <IonIcon
                      icon={documentTextOutline}
                      className="mr-2 text-red-500"
                    />
                    {a.audit_code}
                  </h2>

                  {a.overall_result && (
                    <IonChip
                      className="result-chip"
                      color={
                        a.overall_result === "PASS" ? "success" : "danger"
                      }
                    >
                      <IonIcon icon={ribbonOutline} />
                      <IonLabel>{a.overall_result}</IonLabel>
                    </IonChip>
                  )}
                </div>

                <p className="audit-info flex items-center">
                  <IonIcon
                    icon={businessOutline}
                    className="mr-1 opacity-70"
                  />
                  {a.line?.name}
                </p>

                {statusChip(a.status)}
              </IonCardContent>
            </IonCard>
          ))}
      </IonContent>
    </IonPage>
  );
};

export default Audits;
