import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Input from "../components/ui/Input.jsx";
import Boton from "../components/ui/Boton.jsx";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const usuario = await login(correo, password);
      if (usuario.rol === "recepcion") navigate("/recepcion");
      else if (usuario.rol === "encargado" || usuario.rol === "dueno") navigate("/encargado");
      else setError("Este acceso web es solo para recepcion y encargado/dueño");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo iniciar sesion");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-[#222223]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 90% 5%, rgba(212,175,55,0.22), transparent 40%)," +
          "radial-gradient(circle at 5% 95%, rgba(212,175,55,0.18), transparent 45%)",
      }}
    >
      {/* Borde degradado dorado */}
      <div className="w-full max-w-sm rounded-2xl p-[1.5px] bg-gradient-to-br from-[#93834C] to-[#AC933D]">
        <div className="bg-[#3D3D3F] rounded-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo_final.png" alt="Axolotl" className="w-24 h-24 object-contain" />
            <h1 className="mt-3 text-lg font-bold tracking-[0.3em] text-[#EEEEF3]">AXOLOTL</h1>
            <p className="text-sm text-[#E3E3EC] mt-1">Acceso para recepción / encargado</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-[#D64545] mb-3">{error}</p>}
            <Boton type="submit" className="w-full mt-2" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </Boton>
          </form>

          <p className="text-xs text-[#E3E3EC]/60 mt-6">
            Demo: duena@gym.com / recepcion@gym.com — contraseña 123456
          </p>
        </div>
      </div>
    </div>
  );
}