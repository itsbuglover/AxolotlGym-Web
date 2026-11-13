import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../api/api.js";
import Badge from "../../components/ui/Badge.jsx";
import Boton from "../../components/ui/Boton.jsx";

// Paleta: fondo #222223 · tarjetas #3D3D3F · campos #111111 · dorado #AC933D · borde #93834C
const tarjeta = "bg-[#3D3D3F] border border-[#93834C] rounded-lg p-6";
const ID_LECTOR = "lector-qr";

// El QR de la app trae "AXOLOTL-GYM|ACCESO|M-1001": nos quedamos con el ultimo pedazo.
function extraerMembresia(texto) {
  const partes = String(texto).trim().split("|");
  return partes[partes.length - 1].trim();
}

export default function EscanearQR() {
  const [cliente, setCliente] = useState(null);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }
  const [estadoCamara, setEstadoCamara] = useState("apagada"); // apagada | iniciando | activa | error

  const scannerRef = useRef(null);
  const ultimoRef = useRef({ codigo: "", t: 0 });

  // Apaga la camara al salir de la pantalla
  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  // El aviso se quita solo; si fue un registro exitoso tambien se limpia la tarjeta del cliente
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => {
      if (aviso.tipo === "ok") setCliente(null);
      setAviso(null);
    }, 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  async function iniciarCamara() {
    setEstadoCamara("iniciando");
    // Primero la camara trasera (celulares); si no hay, cualquiera (laptops)
    for (const modo of [{ facingMode: "environment" }, { facingMode: "user" }]) {
      try {
        const scanner = new Html5Qrcode(ID_LECTOR);
        scannerRef.current = scanner;
        await scanner.start(
          modo,
          { fps: 10, aspectRatio: 1 },
          (texto) => procesarCodigo(texto),
          () => {} // se llama en cada cuadro sin QR; se ignora
        );
        setEstadoCamara("activa");
        return;
      } catch {
        await detenerCamara();
      }
    }
    setEstadoCamara("error");
  }

  async function detenerCamara() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      /* ya estaba apagada */
    }
  }

  async function apagarCamara() {
    await detenerCamara();
    setEstadoCamara("apagada");
  }

  // Evita procesar el mismo QR muchas veces seguidas mientras la camara lo sigue viendo
  function procesarCodigo(texto) {
    const codigo = extraerMembresia(texto);
    const ahora = Date.now();
    if (ultimoRef.current.codigo === codigo && ahora - ultimoRef.current.t < 3000) return;
    ultimoRef.current = { codigo, t: ahora };
    buscarCliente(codigo);
  }

  async function buscarCliente(codigo) {
    setAviso(null);
    try {
      const { data } = await api.get("/clientes", { params: { buscar: codigo } });
      const encontrado = data.clientes.find(
        (c) =>
          String(c.numMembresia).toLowerCase() === codigo.toLowerCase() ||
          String(c.codigoQr || "").toLowerCase() === codigo.toLowerCase()
      );
      if (!encontrado) {
        setCliente(null);
        setAviso({ tipo: "error", texto: "Codigo no reconocido" });
      } else {
        setCliente(encontrado);
      }
    } catch {
      setCliente(null);
      setAviso({ tipo: "error", texto: "No se pudo consultar al cliente" });
    }
  }

  async function registrar(tipo) {
    if (!cliente) return;
    if (cliente.estado !== "activo") {
      setAviso({ tipo: "error", texto: "Membresia vencida. Pasa a renovar" });
      return;
    }
    try {
      const { data } = await api.post("/qr/registrar", {
        numMembresia: cliente.numMembresia,
        tipo, // "entrada" | "salida"
      });
      setAviso({
        tipo: "ok",
        texto: data.mensaje || (tipo === "entrada" ? "Entrada registrada" : "Salida registrada"),
      });
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.mensaje || "Error al registrar" });
    }
  }

  const inicial = cliente?.nombre?.trim().charAt(0).toUpperCase();

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#EEEEF3] mb-6">Escanear codigo QR</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ---------- Camara ---------- */}
        <div className={tarjeta}>
          <p className="text-sm font-medium text-[#EEEEF3] mb-4">Escanear codigo</p>

          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#111111] mb-4">
            <div
              id={ID_LECTOR}
              className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover"
            />

            {estadoCamara !== "activa" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#E3E3EC]/80">
                {estadoCamara === "iniciando" && <p>Abriendo camara...</p>}
                {estadoCamara === "apagada" && (
                  <>
                    <p>La camara esta apagada</p>
                    <Boton onClick={iniciarCamara}>Encender camara</Boton>
                  </>
                )}
                {estadoCamara === "error" && (
                  <>
                    <p>No se pudo abrir la camara. Revisa que el navegador tenga permiso para usarla.</p>
                    <Boton variante="outline" onClick={iniciarCamara}>Reintentar</Boton>
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
            <Boton variante="outline" className="w-full" onClick={apagarCamara}>
              Apagar camara
            </Boton>
          )}
        </div>

        {/* ---------- Informacion del cliente ---------- */}
        <div className={tarjeta}>
          <p className="text-sm font-medium text-[#EEEEF3]">Informacion del cliente</p>
          <div className="my-4 h-px bg-[#93834C]/60" />

          {!cliente ? (
            <p className="text-sm text-[#E3E3EC]/70 text-center py-10">
              Escanea un codigo para ver la informacion del cliente
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-[72px] h-[72px] shrink-0 rounded-full border-2 border-[#AC933D] bg-[#111111] flex items-center justify-center text-3xl font-bold text-[#AC933D]">
                {inicial}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-[#EEEEF3] truncate">{cliente.nombre}</p>
                <p className="text-sm text-[#E3E3EC] mt-1">Membresia: {cliente.numMembresia}</p>
                <p className="text-sm text-[#E3E3EC] mt-1 flex items-center gap-2">
                  Estado: <Badge estado={cliente.estado} />
                </p>
                {cliente.fechaRegistro && (
                  <p className="text-sm text-[#E3E3EC] mt-1">Registro: {cliente.fechaRegistro}</p>
                )}
              </div>
            </div>
          )}

          <div className="my-4 h-px bg-[#93834C]/60" />

          {aviso && (
            <p
              className={`mb-3 rounded-lg border px-4 py-2.5 text-center text-sm font-bold ${
                aviso.tipo === "ok"
                  ? "border-[#2E8B57] bg-[#2E8B57]/15 text-[#3FB27F]"
                  : "border-[#D64545] bg-[#D64545]/15 text-[#E8706F]"
              }`}
            >
              {aviso.texto}
            </p>
          )}

          <div className="flex gap-3">
            <Boton variante="exito" className="flex-1" disabled={!cliente} onClick={() => registrar("entrada")}>
              Entrada
            </Boton>
            <Boton variante="peligro" className="flex-1" disabled={!cliente} onClick={() => registrar("salida")}>
              Salida
            </Boton>
          </div>
        </div>
      </div>
    </div>
  );
}