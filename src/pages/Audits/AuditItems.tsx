// src/pages/Audits/AuditItems.tsx

import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { Audit } from "../../types/audits";
import { AuditService } from "../../services/AuditService";

const AuditItems: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await AuditService.getAudit(Number(id));
      setAudit(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding bg-darkBg text-white flex justify-center items-center">
          <IonSpinner name="crescent" color="light" />
        </IonContent>
      </IonPage>
    );
  }

  if (!audit) {
    return (
      <IonPage>
        <IonContent className="ion-padding bg-darkBg text-white flex justify-center items-center">
          <p className="text-red-500 font-bold">Auditoría no encontrada.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-black text-white">
          <IonButton fill="clear" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} className="text-white" />
          </IonButton>
          <IonTitle className="font-bold tracking-wide">
            Auditoría
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-darkBg text-white font-poppins">
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-primaryRed/40 shadow-md space-y-2">
          <h2 className="font-bold text-xl mb-2">{audit.audit_code}</h2>
          <p><span className="font-bold">Línea:</span> {audit.line.name}</p>
          <p><span className="font-bold">Turno:</span> {audit.shift}</p>
          <p>
            <span className="font-bold">Estado:</span>{" "}
            <span className="uppercase text-primaryRed font-bold">
              {audit.status}
            </span>
          </p>

          <IonButton
            expand="block"
            className="bg-primaryRed mt-4 rounded-xl font-bold"
            onClick={() => history.push(`/audits/${audit.id}`)}
          >
            Entrar a evaluación
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuditItems;
