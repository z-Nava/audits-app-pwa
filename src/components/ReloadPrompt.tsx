import React, { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useIonAlert } from "@ionic/react";

const ReloadPrompt: React.FC = () => {
  const [registration, setRegistration] =
    React.useState<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
      if (r) setRegistration(r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    if (registration) {
      const interval = setInterval(() => {
        registration.update();
      }, 5000); // Revisar cada 5 segundos para pruebas
      return () => clearInterval(interval);
    }
  }, [registration]);

  // Manejar recarga automática cuando el SW tome el control
  useEffect(() => {
    let refreshing = false;
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange
      );
    }
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange
        );
      }
    };
  }, []);

  const [presentAlert] = useIonAlert();

  useEffect(() => {
    if (needRefresh) {
      presentAlert({
        header: "Actualización disponible",
        message:
          "Hay una nueva versión de la aplicación. ¿Deseas recargar para actualizar?",
        buttons: [
          {
            text: "Cancelar",
            role: "cancel",
            handler: () => setNeedRefresh(false),
          },
          {
            text: "Actualizar",
            role: "confirm",
            handler: () => updateServiceWorker(true),
          },
        ],
        backdropDismiss: false,
      });
    }
  }, [needRefresh, presentAlert, setNeedRefresh, updateServiceWorker]);

  return null;
};

export default ReloadPrompt;
