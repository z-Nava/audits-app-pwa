import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardContent,
} from "@ionic/react";

import { personCircleOutline, lockClosedOutline } from "ionicons/icons";
import useUserStore from "../../store/userStore";
import { AuthService } from "../../services/AuthService";

const Login: React.FC = () => {
  const loginStore = useUserStore((s) => s.login);

  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");
      setLoading(true);

      const response = await AuthService.login(loginField, password);
      loginStore(response.data.token, response.data.user);

      window.location.href = "/assignments";
    } catch (err) {
      setError("Credenciales incorrectas o error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" color="light">

        {/* CONTENEDOR CENTRADO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <IonCard
            style={{
              width: "100%",
              maxWidth: "380px",
              borderRadius: "20px",
              padding: "4px",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <IonCardContent>

              {/* ICONO */}
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <IonIcon
                  icon={personCircleOutline}
                  style={{ fontSize: "70px", color: "#3b82f6" }}
                />
              </div>

              {/* TÍTULO */}
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "24px",
                }}
              >
                Iniciar sesión
              </h2>

              {/* INPUT LOGIN */}
              <IonItem lines="full">
                <IonLabel position="stacked">Número de empleado o email</IonLabel>
                <IonInput
                  value={loginField}
                  placeholder="TEC2001"
                  onIonChange={(e) => setLoginField(e.detail.value!)}
                />
              </IonItem>

              {/* INPUT PASSWORD */}
              <IonItem lines="full" style={{ marginTop: "16px" }}>
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              {/* ERROR MESSAGE */}
              {error && (
                <IonText color="danger">
                  <p style={{ marginTop: "10px", textAlign: "center" }}>
                    {error}
                  </p>
                </IonText>
              )}

              {/* BOTÓN LOGIN */}
              <IonButton
                expand="block"
                style={{
                  marginTop: "24px",
                  height: "48px",
                  borderRadius: "14px",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                disabled={loading}
                onClick={handleLogin}
              >
                {loading ? <IonSpinner name="crescent" /> : "Entrar"}
              </IonButton>

            </IonCardContent>
          </IonCard>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Login;
