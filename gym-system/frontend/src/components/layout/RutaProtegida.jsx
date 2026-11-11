import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Shell from "./Shell.jsx";

// rolesPermitidos: array de roles que pueden entrar a esta seccion
export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/login" replace />;
  }
  return <Shell>{children}</Shell>;
}
