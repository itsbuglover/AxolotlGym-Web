import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Input from "../components/ui/Input.jsx";
import Boton from "../components/ui/Boton.jsx";
import BotonTema from "../components/ui/BotonTema.jsx";
import FondoGym from "../components/ui/FondoGym.jsx";

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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[var(--c-fondo)]">
      <FondoGym />
      <BotonTema className="absolute top-4 right-4 z-10" />

      {/* Tarjeta de cristal con borde dorado giratorio */}
      <div className="fx-borde relative z-10 w-full max-w-sm">
        <div className="fx-cristal rounded-[calc(1rem-1.5px)] p-8">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo_final.png"
              alt="Axolotl"
              className="w-24 h-24 object-contain"
              style={{ filter: "drop-shadow(0 0 18px var(--c-acento-60))" }}
            />
            <h1 className="mt-3 text-lg font-bold tracking-[0.3em] text-[var(--c-texto)]">AXOLOTL</h1>
            <p className="text-sm text-[var(--c-texto-sec)] mt-1">Acceso para recepción / encargado</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input label="Correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-[var(--c-rojo)] mb-3">{error}</p>}
            <Boton type="submit" className="w-full mt-2" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </Boton>
          </form>
        </div>
      </div>
    </div>
  );
}