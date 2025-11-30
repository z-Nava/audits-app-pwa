import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonButton, IonText, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea } from "@ionic/react";
import { AuditService } from "../../services/AuditService";
import { useParams } from "react-router-dom";
import type { Audit, Tool } from "../../types/audits";

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auditId = Number(id);

  const [audit, setAudit] = useState<Audit | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [result, setResult] = useState("PASS");
  const [comments, setComments] = useState("");

  async function loadAudit() {
    const data = await AuditService.getAudit(auditId);
    setAudit(data);
    if (data.items?.length) {
      const item = data.items[0];
      setItemId(item.id);
      setResult(item.result);
      setComments(item.comments || "");
    }
  }

  async function createItem() {
    if (!audit) return;
    const tool: Tool | undefined = audit.assignment.tools?.[0];
    if (!tool) {
      alert("No hay herramienta asignada.");
      return;
    }

    const item = await AuditService.createItem(audit.id, tool.id);
    setItemId(item.id);
    alert("Item creado");
  }

  async function saveItem() {
    if (!itemId) return alert("Primero debes crear el item.");
    await AuditService.updateItem(itemId, {
      result,
      comments,
    });
    alert("Guardado");
  }

  async function submitAudit() {
    await AuditService.submitAudit(auditId);
    alert("Auditoría enviada");
    window.location.href = "/assignments";
  }

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding">

        {audit && (
          <>
            <h2>Auditoría {audit.audit_code}</h2>
            <p>Línea: {audit.assignment.line.name}</p>
            <p>Shift: {audit.shift}</p>

            {/* NOTAS */}
            {audit.assignment.notes && (
              <IonText color="medium">
                <p><strong>Notas:</strong> {audit.assignment.notes}</p>
              </IonText>
            )}

            {/* Crear ITEM */}
            {!itemId && (
              <IonButton onClick={createItem}>
                Registrar resultado de herramienta
              </IonButton>
            )}

            {/* FORMULARIO */}
            {itemId && (
              <>
                <IonItem>
                  <IonLabel>Resultado</IonLabel>
                  <IonSelect
                    value={result}
                    onIonChange={(e) => setResult(e.detail.value)}
                  >
                    <IonSelectOption value="PASS">PASS</IonSelectOption>
                    <IonSelectOption value="FAIL">FAIL</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Comentarios</IonLabel>
                  <IonTextarea
                    value={comments}
                    onIonChange={(e) => setComments(e.detail.value!)}
                  />
                </IonItem>

                <IonButton expand="block" onClick={saveItem}>
                  Guardar resultado
                </IonButton>

                <IonButton color="success" expand="block" onClick={submitAudit}>
                  Enviar Auditoría
                </IonButton>
              </>
            )}
          </>
        )}

      </IonContent>
    </IonPage>
  );
};

export default AuditDetail;
