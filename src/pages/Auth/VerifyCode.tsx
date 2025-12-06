import React, { useState } from "react";
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
import { keyOutline, checkmarkCircleOutline } from "ionicons/icons";
import useUserStore from "../../store/userStore";
import { AuthService } from "../../services/AuthService";
import { useHistory, useLocation } from "react-router-dom";

const VerifyCode: React.FC = () => {
  const loginStore = useUserStore((s) => s.login);
  const history = useHistory();
  const location = useLocation<{ email: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    try {
      setError("");
      setLoading(true);
      if (!code || code.length < 4) {
        setError("Código inválido");
        setLoading(false);
        return;
      }
      const email = localStorage.getItem("temp_email");
      if (!email) {
        setError(
          "Sesión expirada o email no encontrado. Vuelve a iniciar sesión."
        );
        setLoading(false);
        return;
      }

      const response = await AuthService.verifyCode(code, email);
      loginStore(response.data.token, response.data.user);

      localStorage.removeItem("temp_email");
      window.location.href = "/assignments";
    } catch (err) {
      setError("Código incorrecto, intenta de nuevo");
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
                        icon={keyOutline}
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
                          Verificación
                        </h1>
                        <p style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
                          Ingresa el código enviado a tu correo
                        </p>
                      </IonText>
                    </div>

                    <div className="ion-margin-top ion-margin-bottom">
                      <div className="ion-text-center ion-margin-bottom">
                        <IonText color="medium">
                          <small>INGRESA EL CÓDIGO</small>
                        </IonText>
                      </div>
                      <IonInput
                        max={6}
                        min={6}
                        className="custom-verify-input"
                        fill="outline"
                        placeholder="000000"
                        value={code}
                        type="number"
                        onIonInput={(e) => {
                          const val = e.detail.value!;
                          if (val.length > 6) {
                            e.target.value = val.slice(0, 6);
                            setCode(val.slice(0, 6));
                          } else {
                            setCode(val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleVerify();
                        }}
                        style={{
                          "--background": "rgba(0, 0, 0, 0.3)",
                          "--color": "#ffffff",
                          "--placeholder-color": "#555",
                          "--border-color": "rgba(255, 255, 255, 0.2)",
                          "--border-radius": "12px",
                          "--border-width": "1px",
                          "--padding-start": "10px",
                          "--padding-end": "10px",
                          textAlign: "center",
                          fontSize: "2rem",
                          letterSpacing: "1.5rem",
                          fontWeight: "bold",
                          fontFamily: "monospace",
                          height: "70px",
                        }}
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
                      onClick={handleVerify}
                      disabled={loading}
                      style={{
                        "--background":
                          "linear-gradient(90deg, #10c842 0%, #0c9b2e 100%)", // Verde para verificación
                        "--box-shadow": "0 4px 15px rgba(16, 200, 66, 0.4)",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        height: "48px",
                      }}
                    >
                      {loading ? (
                        <IonSpinner name="crescent" color="light" />
                      ) : (
                        <>
                          <IonIcon slot="start" icon={checkmarkCircleOutline} />
                          Verificar
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

export default VerifyCode;
