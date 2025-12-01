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

import { personCircleOutline, mailOutline, lockClosedOutline } from "ionicons/icons";
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
      <IonContent
        fullscreen
        className="ion-padding"
        style={{
          fontFamily: "Poppins, sans-serif",
          background: "linear-gradient(180deg, #000 0%, #1A1A1A 100%)",
        }}
      >
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
              background: "#111",
              padding: "10px",
              boxShadow: "0px 0px 25px rgba(200,16,46,0.55)",
            }}
          >
            <IonCardContent>

              {/* ICON */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <IonIcon
                  icon={personCircleOutline}
                  style={{ fontSize: "85px", color: "#fff" }}
                />
              </div>

              {/* TITLE */}
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: "24px",
                  color: "#fff",
                  marginBottom: "35px",
                  textTransform: "uppercase",
                }}
              >
                Acceso
              </h2>

              {/* INPUT LOGIN */}
              <IonItem
                lines="none"
                style={{
                  "--padding-start": "0px",
                  "--padding-end": "0px",
                  marginBottom: "25px",
                  borderBottom: "2px solid #4b4b4b",
                }}
                className="input-focused"
              >
                <IonIcon slot="start" icon={mailOutline} style={{ color: "#aaa", marginRight: "10px" }} />
                <IonLabel style={{ color: "#aaa" }} position="floating">
                  Usuario o Email
                </IonLabel>
                <IonInput
                  style={{ color: "#fff" }}
                  placeholder="TEC2001"
                  value={loginField}
                  onIonChange={(e) => setLoginField(e.detail.value!)}
                />
              </IonItem>

              {/* INPUT PASSWORD */}
              <IonItem
                lines="none"
                style={{
                  "--padding-start": "0px",
                  "--padding-end": "0px",
                  marginBottom: "10px",
                  borderBottom: "2px solid #4b4b4b",
                }}
              >
                <IonIcon slot="start" icon={lockClosedOutline} style={{ color: "#aaa", marginRight: "10px" }} />
                <IonLabel style={{ color: "#aaa" }} position="floating">
                  Contraseña
                </IonLabel>
                <IonInput
                  type="password"
                  style={{ color: "#fff" }}
                  placeholder="••••••••"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              {error && (
                <IonText color="danger">
                  <p style={{ textAlign: "center", marginTop: "5px" }}>{error}</p>
                </IonText>
              )}

              {/* BUTTON */}
              <IonButton
                expand="block"
                style={{
                  marginTop: "30px",
                  height: "50px",
                  borderRadius: "14px",
                  fontWeight: "700",
                  "--background": "#C8102E",
                  letterSpacing: "1px",
                  fontSize: "16px",
                  textTransform: "uppercase",
                }}
                disabled={loading}
                onClick={handleLogin}
              >
                {loading ? <IonSpinner /> : "Entrar"}
              </IonButton>

            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
