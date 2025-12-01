// src/pages/Audits/AuditItems.tsx

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
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
} from "@ionic/react";

import { constructOutline, clipboardOutline } from "ionicons/icons";
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
          <p className="text-center text-red-500 font-bold text-lg">
            No se encontró la auditoría.
          </p>
        </IonContent>
      </IonPage>
    );
  }

  const tools = audit.assignment?.tools ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-black text-white">
          <IonTitle className="font-bold uppercase tracking-wide">
            Elementos a evaluar
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-darkBg text-white font-poppins">
        {/* Tarjeta info de auditoría */}
        <IonCard className="bg-[#1A1A1A] border border-primaryRed/40 rounded-2xl shadow-md mb-4">
          <IonCardContent>
            <div className="flex items-center gap-3 mb-4">
              <IonIcon
                icon={clipboardOutline}
                className="text-primaryRed text-3xl"
              />
              <h2 className="font-bold text-lg">
                Auditoría {audit.audit_code}
              </h2>
            </div>

            <p className="text-sm mb-1">
              <span className="font-bold">Línea:</span> {audit.line.name}
            </p>
            <p className="text-sm mb-1">
              <span className="font-bold">Turno:</span> {audit.shift}
            </p>
            <p className="text-sm mb-1">
              <span className="font-bold">Estado:</span>{" "}
              <span className="uppercase text-primaryRed font-bold">
                {audit.status}
              </span>
            </p>
          </IonCardContent>
        </IonCard>

        {/* Lista de herramientas */}
        <h3 className="mt-4 mb-3 font-semibold text-lg uppercase text-primaryRed flex items-center gap-2">
          Herramientas asociadas
        </h3>

        <IonList className="bg-transparent">
          {tools.length === 0 && (
            <p className="text-gray-400 text-sm">
              No hay herramientas asignadas.
            </p>
          )}

          {tools.map((tool: any) => (
            <IonItem
              key={tool.id}
              button
              routerLink={`/audits/${audit.id}/items/${tool.id}`}
              className="bg-[#111] rounded-xl my-2 border border-primaryRed/20 hover:border-primaryRed transition-colors duration-200"
            >
              <IonIcon
                icon={constructOutline}
                slot="start"
                className="text-primaryRed text-2xl"
              />
              <IonLabel>
                <h2 className="font-bold text-white">{tool.name}</h2>
                <p className="text-gray-400 text-sm">{tool.code}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonButton
          expand="block"
          className={`mt-8 h-12 rounded-xl font-bold tracking-wide ${
            audit.status === "submitted" ? "bg-gray-600" : "bg-primaryRed"
          }`}
          disabled={audit.status === "submitted"}
        >
          Enviar auditoría
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AuditItems;
