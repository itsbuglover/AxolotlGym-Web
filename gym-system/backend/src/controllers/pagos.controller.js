import { supabase, rpc, consulta, manejar, errorHttp, numero } from "../data/supabase.js";

// Vista pagos_pendientes -> forma que usa el frontend.
// La lista NO trae la imagen (pesa); se pide aparte en /:id/comprobante
const aPago = (p) => ({
  id: p.id,
  clienteId: p.cliente_id,
  cliente: p.cliente,
  numMembresia: p.numero_membresia || "",
  plan: p.plan,
  monto: numero(p.monto),
  metodo: p.metodo_pago,
  fecha: p.fecha_pago,
  estado: "pendiente",
  tieneComprobante: !!p.tiene_comprobante,
});

export const listarPagosPendientes = manejar(async (req, res) => {
  const filas = await consulta(
    supabase.from("pagos_pendientes").select("*").order("fecha_pago", { ascending: true })
  );
  res.json({ ok: true, pagos: filas.map(aPago) });
});

// Solo Encargado: comprobante_pago lo valida en la base
export const obtenerComprobante = manejar(async (req, res) => {
  const b64 = await rpc("comprobante_pago", {
    p_actor_gmail: req.usuario.correo,
    p_pago_id: Number(req.params.id),
  });
  // La base guarda el JPEG en base64 sin prefijo; el <img> lo necesita
  const comprobante = b64 ? (String(b64).startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`) : null;
  res.json({ ok: true, comprobante });
});

// confirmar_pago: Encargado cualquier pago; Recepcion solo los que no son transferencia.
// Al aceptar activa la membresia y el pago entra a ingresos (Dashboard / Reportes).
export const aceptarPago = manejar(async (req, res) => {
  const vence = await rpc("confirmar_pago", {
    p_actor_gmail: req.usuario.correo,
    p_pago_id: Number(req.params.id),
    p_aceptar: true,
  });
  res.json({ ok: true, vence, mensaje: "Pago validado" });
});

export const rechazarPago = manejar(async (req, res) => {
  const motivo = String(req.body?.motivo || "").trim();
  if (motivo.length < 3) throw errorHttp(400, "Escribe el motivo del rechazo");
  await rpc("rechazar_pago", {
    p_actor_gmail: req.usuario.correo,
    p_pago_id: Number(req.params.id),
    p_motivo: motivo.slice(0, 200),
  });
  res.json({ ok: true, mensaje: "Pago rechazado" });
});