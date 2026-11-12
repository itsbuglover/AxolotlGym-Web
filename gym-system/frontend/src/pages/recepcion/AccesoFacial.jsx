import { useEffect, useRef, useState } from "react";
import api from "../../api/api.js";
import Badge from "../../components/ui/Badge.jsx";
import Boton from "../../components/ui/Boton.jsx";
import { cargarModelos, CapturaFacial, INDICACION, RECORTES } from "../../facial/reconocedor.js";

// Paleta: fondo #222223 · tarjetas #3D3D3F · campos #111111 · dorado #AC933D · borde #93834C
const tarjeta = "bg-[#3D3D3F] border border-[#93834C] rounded-lg p-6";
const INTERVALO_MS = 120; // cada cuanto se analiza un cuadro

// Recorte que funciono la ultima vez (se prueba primero). Es solo una preferencia de este navegador.
const CLAVE_RECORTE = "acceso_facial_recorte";
function ordenRecortes() {
  let primero = 0;
  try {
    primero = Number(localStorage.getItem(CLAVE_RECORTE)) || 0;
  } catch {
    /* sin almacenamiento: orden normal */
  }
  if (!(primero >= 0 && primero < RECORTES.length)) primero = 0;
  return [primero, ...RECORTES.map((_, i) => i).filter((i) => i !== primero)];
}
function recordarRecorte(i) {
  try {
    localStorage.setItem(CLAVE_RECORTE, String(i));
  } catch {
    /* no pasa nada */
  }
}

const hora = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "";

// Mismos mensajes que la app (AccesoFacialScreen.kt)
function mensaje(m) {
  const nombre = m.nombre || "El cliente";
  switch (m.resultado) {
    case "ENTRADA":
      return { texto: `${nombre} ha ingresado - ${hora(m.fechaHora)}`, error: false };
    case "SALIDA": {
      const min = m.entradaDesde ? Math.floor((new Date(m.fechaHora) - new Date(m.entradaDesde)) / 60000) : 0;
      const texto =
        min < 1 ? `${nombre} ha salido. Estuvo menos de un minuto`
        : min < 60 ? `${nombre} ha salido. Estuvo menos de ${min} minutos`
        : `${nombre} ha salido. Estuvo ${Math.floor(min / 60)} h ${min % 60} min`;
      return { texto, error: false };
    }
    case "DENEGADO":
      return { texto: "Acceso denegado: membresía inactiva. Pasa a renovar", error: true };
    case "REPETIDO":
      return { texto: `${nombre} ya fue registrado hace un momento`, error: false };
    case "YA_DENTRO":
      return { texto: `${nombre} ya tiene una entrada registrada`, error: true };
    case "SIN_ENTRADA":
      return { texto: `${nombre} no tiene una entrada abierta`, error: true };
    default:
      return { texto: "Acceso denegado: rostro no registrado", error: true };
  }
}

export default function AccesoFacial() {
  const [estadoCamara, setEstadoCamara] = useState("apagada"); // apagada | cargando | activa | error
  const [errorCamara, setErrorCamara] = useState("");
  const [indicacion, setIndicacion] = useState(INDICACION.camara);
  const [progreso, setProgreso] = useState(0);
  const [cliente, setCliente] = useState(null);
  const [aviso, setAviso] = useState(null); // { texto, error }
  const [dentro, setDentro] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const capturaRef = useRef(null);
  const timerRef = useRef(null);
  const pausaRef = useRef(false);

  // Personas dentro del gimnasio (cada 5 s, como la app)
  useEffect(() => {
    const leer = () => api.get("/acceso/ocupacion").then((r) => setDentro(r.data.dentro)).catch(() => {});
    leer();
    const t = setInterval(leer, 5000);
    return () => clearInterval(t);
  }, []);

  // Los datos del cliente se muestran 5 segundos
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => {
      setCliente(null);
      setAviso(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  // Apaga la camara al salir de la pantalla
  useEffect(() => () => detener(), []);

  function detener() {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function encender() {
    setEstadoCamara("cargando");
    setErrorCamara("");
    try {
      const [modelos, stream] = await Promise.all([
        cargarModelos(),
        // Camara frontal (la de la laptop o la del celular que mira al cliente)
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        }),
      ]);
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      capturaRef.current = new CapturaFacial(modelos);
      pausaRef.current = false;
      setEstadoCamara("activa");
      ciclo();
    } catch (e) {
      detener();
      setEstadoCamara("error");
      setErrorCamara(
        e?.name === "NotAllowedError" || e?.name === "NotFoundError"
          ? "No se pudo abrir la cámara. Revisa que el navegador tenga permiso para usarla."
          : "No se pudo cargar el reconocimiento facial. Revisa tu conexión y reintenta."
      );
      console.error(e);
    }
  }

  function apagar() {
    detener();
    setEstadoCamara("apagada");
    setIndicacion(INDICACION.camara);
    setProgreso(0);
  }

  function ciclo() {
    if (!streamRef.current) return;
    if (!pausaRef.current) {
      try {
        const paso = capturaRef.current.procesar(videoRef.current);
        if (paso.tipo === "listo") {
          pausaRef.current = true;
          capturaRef.current.marcarProcesado();
          setIndicacion(INDICACION.verificando);
          setProgreso(1);
          identificar(paso.vectores);
        } else {
          setIndicacion(paso.texto);
          setProgreso(paso.progreso);
        }
      } catch (e) {
        console.error(e); // cuadro descartado
      }
    }
    timerRef.current = setTimeout(ciclo, INTERVALO_MS);
  }

  async function identificar(vectores) {
    try {
      // Se prueba cada recorte hasta que la base reconozca al cliente.
      // NO_RECONOCIDO no registra nada, asi que reintentar es seguro.
      let movimiento = null;
      let mejor = 0;
      for (const i of ordenRecortes()) {
        const { data } = await api.post("/acceso/rostro", { embedding: vectores[i] });
        movimiento = data.movimiento;
        mejor = Math.max(mejor, movimiento.similitud ?? 0);
        if (movimiento.resultado !== "NO_RECONOCIDO") {
          recordarRecorte(i);
          break;
        }
      }
      if (movimiento.resultado === "NO_RECONOCIDO") {
        console.info(`Rostro no reconocido. Mejor similitud: ${mejor.toFixed(2)} (se necesita 0.70)`);
        capturaRef.current?.olvidarProcesado();
      }
      mostrar(movimiento);
    } catch {
      capturaRef.current?.olvidarProcesado();
      setCliente(null);
      setAviso({ texto: "Sin conexión con la base de datos", error: true });
    }
    setTimeout(() => {
      setProgreso(0);
      pausaRef.current = false;
    }, 2500);
  }

  function mostrar(m) {
    setDentro(m.dentroTotal);
    setAviso(mensaje(m));
    if (m.clienteId == null) {
      setCliente(null);
      return;
    }
    setCliente({
      id: m.clienteId,
      nombre: m.nombre || "Cliente",
      membresia: m.membresia || "—",
      activo: m.activa === true,
      dentroDesde: m.esEntrada ? m.entradaDesde || m.fechaHora : null,
      foto: null,
    });
    // La foto llega aparte para no retrasar el registro
    api
      .get(`/acceso/foto/${m.clienteId}`)
      .then(({ data }) => {
        if (data.foto) setCliente((c) => (c?.id === m.clienteId ? { ...c, foto: data.foto } : c));
      })
      .catch(() => {});
  }

  const inicial = cliente?.nombre?.trim().charAt(0).toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#EEEEF3]">Acceso con reconocimiento facial</h1>
        <span className="px-3.5 py-1 rounded-full border border-[#AC933D] bg-[#AC933D]/15 text-sm font-bold text-[#AC933D]">
          Dentro: {dentro}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ---------- Camara ---------- */}
        <div className={tarjeta}>
          <p className="text-sm font-medium text-[#EEEEF3] mb-4">Cámara</p>

          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#111111] mb-4">
            {/* Se ve en espejo para el cliente; el analisis usa el cuadro sin voltear, como la app */}
            <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />

            {estadoCamara !== "activa" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#E3E3EC]/80">
                {estadoCamara === "cargando" && <p>Cargando reconocimiento facial...</p>}
                {estadoCamara === "apagada" && (
                  <>
                    <p>La cámara está apagada</p>
                    <Boton onClick={encender}>Encender cámara</Boton>
                  </>
                )}
                {estadoCamara === "error" && (
                  <>
                    <p>{errorCamara}</p>
                    <Boton variante="outline" onClick={encender}>Reintentar</Boton>
                  </>
                )}
              </div>
            )}

            <span className="pointer-events-none absolute top-3 left-3 w-9 h-9 border-t-4 border-l-4 border-[#AC933D] rounded-tl-lg" />
            <span className="pointer-events-none absolute top-3 right-3 w-9 h-9 border-t-4 border-r-4 border-[#AC933D] rounded-tr-lg" />
            <span className="pointer-events-none absolute bottom-3 left-3 w-9 h-9 border-b-4 border-l-4 border-[#AC933D] rounded-bl-lg" />
            <span className="pointer-events-none absolute bottom-3 right-3 w-9 h-9 border-b-4 border-r-4 border-[#AC933D] rounded-br-lg" />
          </div>

          {estadoCamara === "activa" && (
            <>
              <p className="text-center text-sm font-semibold text-[#EEEEF3] mb-2">{indicacion}</p>
              <div className="h-1.5 rounded-full bg-[#111111] overflow-hidden mb-4">
                <div className="h-full bg-[#AC933D] transition-all duration-200" style={{ width: `${progreso * 100}%` }} />
              </div>
              <Boton variante="outline" className="w-full" onClick={apagar}>
                Apagar cámara
              </Boton>
            </>
          )}
        </div>

        {/* ---------- Informacion del cliente ---------- */}
        <div className={tarjeta}>
          <p className="text-sm font-medium text-[#EEEEF3]">Información del cliente</p>
          <div className="my-4 h-px bg-[#93834C]/60" />

          {!cliente ? (
            <p className="text-sm text-[#E3E3EC]/70 text-center py-10">
              La entrada o salida se registra sola cuando el cliente mira a la cámara
            </p>
          ) : (
            <div className="flex items-center gap-4">
              {cliente.foto ? (
                <img
                  src={`data:image/jpeg;base64,${cliente.foto}`}
                  alt={cliente.nombre}
                  className="w-[72px] h-[72px] shrink-0 rounded-full border-2 border-[#AC933D] object-cover"
                />
              ) : (
                <div className="w-[72px] h-[72px] shrink-0 rounded-full border-2 border-[#AC933D] bg-[#111111] flex items-center justify-center text-3xl font-bold text-[#AC933D]">
                  {inicial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-lg font-bold text-[#EEEEF3] truncate">{cliente.nombre}</p>
                <p className="text-sm text-[#E3E3EC] mt-1">Membresía: {cliente.membresia}</p>
                <p className="text-sm text-[#E3E3EC] mt-1 flex items-center gap-2">
                  Estado: <Badge estado={cliente.activo ? "activo" : "inactivo"} />
                </p>
                {cliente.dentroDesde && (
                  <p className="text-sm text-[#E3E3EC] mt-1">Dentro desde: {hora(cliente.dentroDesde)}</p>
                )}
              </div>
            </div>
          )}

          <div className="my-4 h-px bg-[#93834C]/60" />

          {aviso && (
            <p
              className={`rounded-lg border px-4 py-2.5 text-center text-sm font-bold ${
                aviso.error
                  ? "border-[#D64545] bg-[#D64545]/15 text-[#E8706F]"
                  : "border-[#2E8B57] bg-[#2E8B57]/15 text-[#3FB27F]"
              }`}
            >
              {aviso.texto}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
