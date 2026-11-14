import { useEffect, useRef, useState } from "react";
import api from "../../api/api.js";
import Boton from "../ui/Boton.jsx";
import Modal from "../ui/Modal.jsx";

const dinero = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

const fechaApp = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const msgError = (e, base) => `${base}: ${e.response?.data?.mensaje || e.message}`;

/**
 * Pagos pendientes de validar (equivale a PagosScreen de la app en Kotlin).
 * - puedeVerComprobante=true  -> Encargado / Dueño: ve la imagen y puede resolver todo.
 * - puedeVerComprobante=false -> Recepción: sin imagen, y solo resuelve pagos que
 *   no sean transferencia (igual que confirmar_pago en la BD).
 */
export default function PagosPendientes({ puedeVerComprobante = false }) {
  const [pagos, setPagos] = useState([]);
  const [imagenes, setImagenes] = useState({}); // id -> dataURI | null
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [confirmar, setConfirmar] = useState(null); // { pago, aceptar }
  const [motivo, setMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [ampliada, setAmpliada] = useState(null);
  const pedidas = useRef(new Set()); // comprobantes ya solicitados

  useEffect(() => {
    recargar();
  }, []);

  async function recargar() {
    try {
      const { data } = await api.get("/pagos");
      setPagos(data.pagos);
      setError("");
      if (puedeVerComprobante) {
        data.pagos
          .filter((p) => p.tieneComprobante && !pedidas.current.has(p.id))
          .forEach((p) => cargarImagen(p.id));
      }
    } catch (e) {
      setError(msgError(e, "No se pudo cargar"));
    } finally {
      setCargando(false);
    }
  }

  async function cargarImagen(id) {
    pedidas.current.add(id);
    try {
      const { data } = await api.get(`/pagos/${id}/comprobante`);
      setImagenes((prev) => ({ ...prev, [id]: data.comprobante }));
    } catch {
      setImagenes((prev) => ({ ...prev, [id]: null }));
    }
  }

  async function resolver() {
    const { pago, aceptar } = confirmar;
    setProcesando(true);
    try {
      if (aceptar) {
        await api.put(`/pagos/${pago.id}/aceptar`);
        setMensaje(`Pago de ${pago.cliente} validado. Su membresía quedó activa.`);
      } else {
        await api.put(`/pagos/${pago.id}/rechazar`, { motivo: motivo.trim() });
        setMensaje(`Pago de ${pago.cliente} rechazado.`);
      }
      setError("");
      await recargar();
    } catch (e) {
      setMensaje("");
      setError(msgError(e, "No se pudo guardar"));
    } finally {
      setProcesando(false);
      setConfirmar(null);
    }
  }

  const puedeResolver = (p) => puedeVerComprobante || p.metodo !== "Transferencia";

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--c-texto)]">Pagos</h1>
      <p className="text-sm text-[var(--c-texto-sec)] mb-6">Pendientes de validar: {pagos.length}</p>

      {mensaje && <p className="text-sm text-[var(--c-verde)] mb-3">{mensaje}</p>}
      {error && <p className="text-sm text-[var(--c-rojo)] mb-3">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pagos.map((pago) => (
          <PagoCard
            key={pago.id}
            pago={pago}
            mostrarImagen={puedeVerComprobante}
            imagen={imagenes[pago.id]}
            cargandoImagen={puedeVerComprobante && pago.tieneComprobante && imagenes[pago.id] === undefined}
            habilitado={!procesando && puedeResolver(pago)}
            soloEncargado={!puedeResolver(pago)}
            onAmpliar={setAmpliada}
            onAceptar={() => setConfirmar({ pago, aceptar: true })}
            onRechazar={() => {
              setMotivo("");
              setConfirmar({ pago, aceptar: false });
            }}
          />
        ))}
      </div>

      {pagos.length === 0 && !cargando && !error && (
        <p className="text-center text-sm text-[var(--c-texto-sec)] mt-10">
          No hay pagos pendientes por validar.
        </p>
      )}

      {/* Confirmación aceptar / rechazar */}
      <Modal
        abierto={!!confirmar}
        titulo={confirmar?.aceptar ? "Aceptar pago" : "Rechazar pago"}
        onClose={() => !procesando && setConfirmar(null)}
      >
        {confirmar && (
          <div>
            <p className="text-sm text-[var(--c-texto-sec)] mb-4">
              {confirmar.aceptar
                ? `¿Validar el pago de ${dinero(confirmar.pago.monto)} de ${confirmar.pago.cliente}? Se sumará a los ingresos de hoy y se activará su membresía.`
                : `¿Rechazar el pago de ${confirmar.pago.cliente}? No se sumará a los ingresos y el cliente verá el motivo en su pestaña Pagos.`}
            </p>

            {!confirmar.aceptar && (
              <label className="block mb-4">
                <span className="block text-sm font-medium text-[var(--c-texto-sec)] mb-1">
                  Motivo del rechazo
                </span>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={motivo}
                  disabled={procesando}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. El monto no coincide con el plan"
                  className="w-full bg-[var(--c-campo)] border border-[var(--c-borde)] text-[var(--c-texto)] placeholder:text-[var(--c-texto-tenue)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--c-rojo)]"
                />
              </label>
            )}

            <div className="flex justify-end gap-2">
              <Boton variante="ghost" disabled={procesando} onClick={() => setConfirmar(null)}>
                Cancelar
              </Boton>
              <Boton
                variante={confirmar.aceptar ? "exito" : "peligro"}
                disabled={procesando || (!confirmar.aceptar && motivo.trim().length < 3)}
                onClick={resolver}
              >
                {confirmar.aceptar ? "Aceptar" : "Rechazar"}
              </Boton>
            </div>
          </div>
        )}
      </Modal>

      {/* Comprobante ampliado */}
      <Modal abierto={!!ampliada} titulo="Comprobante de pago" onClose={() => setAmpliada(null)}>
        {ampliada && <img src={ampliada} alt="Comprobante de pago" className="w-full max-h-[70vh] object-contain" />}
      </Modal>
    </div>
  );
}

/** Tarjeta con: cliente, plan, monto, método, comprobante y botones. */
function PagoCard({
  pago, mostrarImagen, imagen, cargandoImagen, habilitado, soloEncargado,
  onAmpliar, onAceptar, onRechazar,
}) {
  return (
    <div className="bg-[var(--c-tarjeta)] border border-[var(--c-borde)] rounded-2xl p-4 flex flex-col">
      <p className="text-lg font-bold text-[var(--c-texto)]">{pago.cliente}</p>
      {pago.numMembresia && <p className="text-xs text-[var(--c-texto-sec)]">{pago.numMembresia}</p>}

      <p className="mt-2 text-sm font-medium text-[var(--c-acento)]">
        Plan: {pago.plan || "—"} · {dinero(pago.monto)}
      </p>
      <p className="text-xs text-[var(--c-texto-sec)]">
        {pago.metodo} · enviado el {fechaApp(pago.fecha)}
      </p>

      {/* Comprobante (la imagen solo la ve el Encargado) */}
      <div className="mt-3 min-h-[160px] max-h-[260px] rounded-lg bg-[var(--c-fondo)] flex items-center justify-center overflow-hidden">
        {mostrarImagen && imagen ? (
          <img
            src={imagen}
            alt={`Comprobante de ${pago.cliente}`}
            onClick={() => onAmpliar(imagen)}
            className="w-full h-full max-h-[260px] object-contain cursor-zoom-in"
          />
        ) : mostrarImagen && cargandoImagen ? (
          <span className="text-xs text-[var(--c-texto-sec)]">Cargando comprobante…</span>
        ) : (
          <div className="text-center px-3">
            <p className="text-3xl text-[var(--c-texto-sec)]">🖼</p>
            <p className="text-xs text-[var(--c-texto-sec)]">
              {!pago.tieneComprobante
                ? "Sin comprobante (registrado en Recepción)"
                : mostrarImagen
                ? "No se pudo cargar el comprobante"
                : "Comprobante de pago (solo lo ve el Encargado)"}
            </p>
          </div>
        )}
      </div>
      {mostrarImagen && imagen && (
        <p className="text-[11px] text-[var(--c-texto-sec)] mt-1">Haz clic en la imagen para ampliarla</p>
      )}

      <div className="mt-3 flex gap-3">
        <Boton variante="peligro" className="flex-1 font-bold" disabled={!habilitado} onClick={onRechazar}>
          Rechazar
        </Boton>
        <Boton variante="exito" className="flex-1 font-bold" disabled={!habilitado} onClick={onAceptar}>
          Aceptar
        </Boton>
      </div>
      {soloEncargado && (
        <p className="text-[11px] text-[var(--c-texto-sec)] mt-2 text-center">
          Las transferencias las valida el Encargado.
        </p>
      )}
    </div>
  );
}