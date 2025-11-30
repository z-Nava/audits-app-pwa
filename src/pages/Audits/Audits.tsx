import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
} from "@ionic/react";

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

  return (
    <IonPage>
      <IonContent className="ion-padding">

        <h2>Mis Auditorías</h2>

        {loading && <IonSpinner />}

        {!loading && audits.length === 0 && (
          <p>No tienes auditorías asignadas.</p>
        )}

        <IonList>
          {audits.map((a) => (
            <IonItem
              key={a.id}
              button
              routerLink={`/audits/${a.id}`}
            >
              <IonLabel>
                <h2>{a.audit_code}</h2>
                <p>{a.line?.name}</p>
              </IonLabel>

              <IonBadge color={a.status === "submitted" ? "danger" : "success"}>
                {a.status}
              </IonBadge>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Audits;
