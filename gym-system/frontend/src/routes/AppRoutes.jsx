
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Inicio from "../pages/Inicio.jsx";

import RutaProtegida from "../components/layout/RutaProtegida.jsx";

// Recepcion
import EscanearQR from "../pages/recepcion/EscanearQR.jsx";
import Clientes from "../pages/recepcion/Clientes.jsx";
import Solicitudes from "../pages/recepcion/Solicitudes.jsx";

// Encargado / Dueño
import Dashboard from "../pages/encargado/Dashboard.jsx";
import Personal from "../pages/encargado/Personal.jsx"; // recepcion, instructores, encargados
import Servicios from "../pages/encargado/Servicios.jsx";
import Gastos from "../pages/encargado/Gastos.jsx";
import Reportes from "../pages/encargado/Reportes.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Página publicitaria */}
      <Route path="/" element={<Inicio />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Recepcion */}
      <Route
        path="/recepcion"
        element={
          <RutaProtegida rolesPermitidos={["recepcion"]}>
            <EscanearQR />
          </RutaProtegida>
        }
      />

      <Route
        path="/recepcion/clientes"
        element={
          <RutaProtegida rolesPermitidos={["recepcion"]}>
            <Clientes />
          </RutaProtegida>
        }
      />

      <Route
        path="/recepcion/solicitudes"
        element={
          <RutaProtegida rolesPermitidos={["recepcion"]}>
            <Solicitudes />
          </RutaProtegida>
        }
      />

      {/* Encargado / Dueño */}
      <Route
        path="/encargado"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Dashboard />
          </RutaProtegida>
        }
      />

      <Route
        path="/encargado/clientes"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Clientes />
          </RutaProtegida>
        }
      />

      <Route
        path="/encargado/personal"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Personal />
          </RutaProtegida>
        }
      />

      <Route
        path="/encargado/servicios"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Servicios />
          </RutaProtegida>
        }
      />

      <Route
        path="/encargado/gastos"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Gastos />
          </RutaProtegida>
        }
      />

      <Route
        path="/encargado/reportes"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Reportes />
          </RutaProtegida>
        }
      />

      {/* Rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
