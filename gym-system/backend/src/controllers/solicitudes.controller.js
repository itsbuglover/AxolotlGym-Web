import { supabase, revisar, rpc, aWeb } from "../data/supabase.js";

const aSolicitud = (s) => ({
  id: s.id,
  clienteNombre: s.cliente,
  numMembresia: s.numero_membresia,
  instructorNombre: s.instructor,
  costo: s.costo,
  fechaSolicitud: s.fecha_solicitud,
  estado: aWeb(s.estado), // pendiente | aprobada | rechazada | cancelada
});

export async function listarSolicitudes(req, res) {
  const filas = revisar(await supabase.from("solicitudes_lista").select("*").order("id", { ascending: false }));
  res.json({ ok: true, solicitudes: filas.map(aSolicitud) });
}

export async function contarPendientes(req, res) {
  const r = await supabase.from("solicitudes_lista").select("id", { count: "exact", head: true }).eq("estado", "PENDIENTE");
  revisar(r);
  res.json({ ok: true, pendientes: r.count ?? 0 });
}

// resolver_solicitud valida que siga PENDIENTE y que el instructor tenga cupo
export async function aprobarSolicitud(req, res) {
  await rpc("resolver_solicitud", { p_id: Number(req.params.id), p_estado: "APROBADA" });
  res.json({ ok: true, mensaje: "Solicitud aprobada" });
}

export async function rechazarSolicitud(req, res) {
  await rpc("resolver_solicitud", { p_id: Number(req.params.id), p_estado: "RECHAZADA" });
  res.json({ ok: true, mensaje: "Solicitud rechazada" });
}
