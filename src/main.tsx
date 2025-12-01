import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/auditStyles.css";
import "./theme/variables.css"; // si ya lo tienes

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => console.log("SW registrado", navigator.serviceWorker))
      .catch((err) => console.error("SW ERROR:", err));
  });
}


root.render(<App />);
