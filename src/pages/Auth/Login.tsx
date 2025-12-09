import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from "@ionic/react";
import { personCircleOutline, logInOutline } from "ionicons/icons";
import useUserStore from "../../store/userStore";
import { AuthService } from "../../services/AuthService";
import ReCAPTCHA from "react-google-recaptcha";

const Login: React.FC = () => {
  const history = useHistory();
  const loginStore = useUserStore((s) => s.login);

  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setError("");
      setLoading(true);

      if (!captchaToken) {
        setError("Por favor completa el captcha");
        setLoading(false);
        return;
      }

      const response = await AuthService.login(
        loginField,
        password,
        captchaToken
      );
      // loginStore(response.data.token, response.data.user);

      localStorage.setItem("temp_email", loginField);
      history.push("/verify-code");
    } catch (err) {
      setError("Credenciales incorrectas o error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          style={{
            minHeight: "100%",
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #4a0404 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IonGrid fixed>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                <IonCard
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                  }}
                  className="ion-padding-vertical"
                >
                  <IonCardContent>
                    <div className="ion-text-center ion-margin-bottom">
                      <IonIcon
                        icon={personCircleOutline}
                        style={{
                          fontSize: "5rem",
                          color: "#ffffff",
                          filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))",
                        }}
                      />
                      <IonText>
                        <h1
                          style={{
                            fontWeight: "700",
                            color: "#ffffff",
                            marginTop: "10px",
                            letterSpacing: "1px",
                          }}
                        >
                          Bienvenido 22222
                        </h1>
                        <p style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
                          Inicia sesión para continuar
                        </p>
                      </IonText>
                    </div>

                    <div className="ion-margin-top">
                      <IonInput
                        className="ion-margin-bottom"
                        label="Usuario o Email"
                        labelPlacement="floating"
                        fill="outline"
                        placeholder="Ingresa tu usuario"
                        value={loginField}
                        onIonInput={(e) => setLoginField(e.detail.value!)}
                        style={{
                          "--background": "rgba(0,0,0,0.2)",
                          "--color": "#fff",
                          "--placeholder-color": "#aaa",
                          "--border-color": "rgba(255,255,255,0.2)",
                          "--border-radius": "10px",
                          color: "white",
                        }}
                      />

                      <IonInput
                        className="ion-margin-bottom"
                        label="Contraseña"
                        labelPlacement="floating"
                        fill="outline"
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onIonInput={(e) => setPassword(e.detail.value!)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleLogin();
                        }}
                        style={{
                          "--background": "rgba(0,0,0,0.2)",
                          "--color": "#fff",
                          "--placeholder-color": "#aaa",
                          "--border-color": "rgba(255,255,255,0.2)",
                          "--border-radius": "10px",
                          color: "white",
                        }}
                      />
                    </div>

                    <div
                      className="ion-margin-top ion-margin-bottom ion-text-center"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <ReCAPTCHA
                        sitekey={
                          import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
                          "6Lc6ViMsAAAAAHQtgeFBl2mitttN64MnD8i2wQZV"
                        }
                        onChange={(token) => setCaptchaToken(token)}
                        theme="dark"
                      />
                    </div>

                    {error && (
                      <div className="ion-text-center ion-margin-bottom">
                        <IonText color="danger">
                          <small style={{ fontWeight: "bold" }}>{error}</small>
                        </IonText>
                      </div>
                    )}

                    <IonButton
                      expand="block"
                      shape="round"
                      className="ion-margin-top"
                      onClick={handleLogin}
                      disabled={loading}
                      style={{
                        "--background":
                          "linear-gradient(90deg, #C8102E 0%, #9b0c23 100%)",
                        "--box-shadow": "0 4px 15px rgba(200, 16, 46, 0.4)",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        height: "48px",
                      }}
                    >
                      {loading ? (
                        <IonSpinner name="crescent" color="light" />
                      ) : (
                        <>
                          <IonIcon slot="start" icon={logInOutline} />
                          Entrar
                        </>
                      )}
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
