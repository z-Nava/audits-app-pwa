import React from "react";
import { Route, Redirect } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";

import Login from "../pages/Auth/Login";
import Audits from "../pages/Audits/Audits";
import useUserStore from "../store/userStore";

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const token = useUserStore((s) => s.token);

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const AppRouter: React.FC = () => {
  return (
    <IonRouterOutlet>

      {/* Ruta pública */}
      <Route exact path="/login" component={Login} />

      {/* Rutas protegidas */}
      <PrivateRoute exact path="/audits" component={Audits} />
      <PrivateRoute exact path="/audits/:id" component={Audits} />

      {/* Default */}
      <Redirect exact from="/" to="/audits" />

    </IonRouterOutlet>
  );
};

export default AppRouter;
