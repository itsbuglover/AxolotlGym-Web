import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useIdioma } from "../context/IdiomaContext.jsx";
import Input from "../components/ui/Input.jsx";
import Boton from "../components/ui/Boton.jsx";
import BotonTema from "../components/ui/BotonTema.jsx";
import BotonIdioma from "../components/ui/BotonIdioma.jsx";
import FondoGym from "../components/ui/FondoGym.jsx";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const { tr, traducirMsg } = useIdioma();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const usuario = await login(correo, password);
      if (usuario.rol === "recepcion") navigate("/recepcion");
      else if (usuario.rol === "encargado" || usuario.rol === "dueno") navigate("/encargado");
      else setError(tr.login.soloStaff);
    } catch (err) {
      setError(traducirMsg(err.response?.data?.mensaje) || tr.login.errorDefault);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[var(--c-fondo)]">
      <FondoGym />
      <BotonIdioma className="absolute top-4 left-4 z-10" />
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
            <p className="text-sm text-[var(--c-texto-sec)] mt-1">{tr.login.subtitulo}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input label={tr.login.correo} type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <Input label={tr.login.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-[var(--c-rojo)] mb-3">{error}</p>}
            <Boton type="submit" className="w-full mt-2" disabled={cargando}>
              {cargando ? tr.login.ingresando : tr.login.ingresar}
            </Boton>
          </form>
        </div>
      </div>
    </div>
  );
}