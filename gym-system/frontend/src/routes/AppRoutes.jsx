
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Inicio from "../pages/Inicio.jsx";

import RutaProtegida from "../components/layout/RutaProtegida.jsx";

// Recepcion
// Se carga aparte porque incluye TensorFlow y MediaPipe (pesado)
const AccesoFacial = lazy(() => import("../pages/recepcion/AccesoFacial.jsx"));
import Clientes from "../pages/recepcion/Clientes.jsx";
import Solicitudes from "../pages/recepcion/Solicitudes.jsx";

// Encargado / Dueño
import Dashboard from "../pages/encargado/Dashboard.jsx";
import Usuarios from "../pages/encargado/Usuarios.jsx";
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
            <Suspense fallback={<p className="text-sm text-[#E3E3EC]/70">Cargando...</p>}>
              <AccesoFacial />
            </Suspense>
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
        path="/encargado/usuarios"
        element={
          <RutaProtegida rolesPermitidos={["encargado", "dueno"]}>
            <Usuarios />
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
