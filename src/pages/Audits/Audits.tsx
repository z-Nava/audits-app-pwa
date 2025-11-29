import React from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonText,
} from "@ionic/react";

import useUserStore from "../../store/userStore";

const Audits: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis Auditorías</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>¡Bienvenido técnico!</h2>

        {user ? (
          <>
            <IonText>
              <p>
                Estás logueado como:  
                <strong> {user.name} </strong>
              </p>
            </IonText>

            <IonButton
              expand="block"
              color="danger"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              style={{ marginTop: "20px" }}
            >
              Cerrar sesión
            </IonButton>
          </>
        ) : (
          <p>No hay usuario cargado.</p>
        )}

        <p style={{ marginTop: "50px", opacity: 0.6 }}>
          (Aún no cargamos la lista de auditorías.  
          Esto es solo para confirmar que el login funciona.)
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Audits;
