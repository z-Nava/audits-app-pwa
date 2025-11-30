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
  IonBadge,
  IonSpinner
} from "@ionic/react";

import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await AuditService.get(Number(id));
        setAudit(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalle de Auditoría</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {loading && <IonSpinner />}

        {!loading && !audit && <p>No se encontró la auditoría.</p>}

        {audit && (
          <>
            <h2>{audit.audit_code}</h2>
            <p><strong>Línea:</strong> {audit.line.name}</p>
            <p><strong>Técnico:</strong> {audit.technician.name}</p>
            <p><strong>Supervisor:</strong> {audit.supervisor.name}</p>

            <IonBadge color={audit.status === "submitted" ? "danger" : "primary"}>
              {audit.status}
            </IonBadge>

            <h3 style={{ marginTop: "20px" }}>Resumen</h3>
            <p>{audit.summary || "Sin resumen"}</p>

            {/* Más adelante agregamos:
                - Lista de ítems
                - Botón para subir fotos
                - Botón de submit
                - Navegación */}
          </>
        )}

      </IonContent>
    </IonPage>
  );
};

export default AuditDetail;
