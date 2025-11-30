import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonButton
} from "@ionic/react";

import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const AuditItems: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await AuditService.getAudit(Number(id));
        setAudit(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (!audit) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <h3>No se encontró la auditoría.</h3>
        </IonContent>
      </IonPage>
    );
  }

  // Aún no existen items creados — usaremos las herramientas de la asignación
  const tools = audit.assignment?.tools ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Herramientas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <h2>{audit.audit_code}</h2>
        <p>Línea: {audit.line.name}</p>

        <IonList>
          {tools.length === 0 && (
            <p>No hay herramientas asignadas a esta auditoría.</p>
          )}

          {tools.map((tool: any) => (
            <IonItem
              key={tool.id}
              button
              routerLink={`/audits/${audit.id}/items/${tool.id}`}
            >
              <IonLabel>
                <h2>{tool.name}</h2>
                <p>{tool.code}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonButton
          expand="block"
          color="primary"
          style={{ marginTop: "20px" }}
          disabled={audit.status === "submitted"}
        >
          Enviar auditoría
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default AuditItems;
