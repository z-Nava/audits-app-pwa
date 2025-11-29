import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonCard,
  IonCardContent,
} from "@ionic/react";

import useUserStore from "../../store/userStore";
import { AuthService } from "../../services/AuthService";

const Login: React.FC = () => {
  const loginStore = useUserStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");

      const response = await AuthService.login(email, password);
      const token = response.data.token;
      const user = response.data.user;

      loginStore(token, user);
      console.log("Login exitoso, token almacenado.");
      window.location.href = "/audits";
      
    } catch (err) {
      setError("Credenciales incorrectas o error de conexión");
    }
  }

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        
        {/* Contenedor centrado */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <IonCard style={{ width: "100%", maxWidth: "380px" }}>
            <IonCardContent>

              {/* Título */}
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                Iniciar sesión
              </h2>

              {/* Campo Email */}
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  value={email}
                  placeholder="correo@ejemplo.com"
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              {/* Campo Password */}
              <IonItem style={{ marginTop: "12px" }}>
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              {/* Error */}
              {error && (
                <IonText color="danger">
                  <p style={{ marginTop: "10px" }}>{error}</p>
                </IonText>
              )}

              {/* Botón */}
              <IonButton
                expand="block"
                style={{ marginTop: "20px" }}
                onClick={handleLogin}
              >
                Entrar
              </IonButton>

            </IonCardContent>
          </IonCard>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Login;
