import React from "react";
import { Route, Redirect } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";

import Login from "../pages/Auth/Login";
import Audits from "../pages/Audits/Audits";
import AuditDetail from "../pages/Audits/AuditDetail";

import useUserStore from "../store/userStore";

const AppRouter: React.FC = () => {
  const token = useUserStore((s) => s.token);

  return (
    <IonRouterOutlet>
      <Route path="/login" exact>
        <Login />
      </Route>

      <Route path="/audits" exact>
        {token ? <Audits /> : <Redirect to="/login" />}
      </Route>

      <Route path="/audits/:id">
        {token ? <AuditDetail /> : <Redirect to="/login" />}
      </Route>

      <Route exact path="/">
        <Redirect to="/audits" />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRouter;
