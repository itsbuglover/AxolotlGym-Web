import { supabase, rpc, consulta, manejar, aMinusculas, numero } from "../data/supabase.js";

const aSolicitud = (s) => ({
  id: s.id,
  clienteNombre: s.cliente,
  numMembresia: s.numero_membresia,
  instructorNombre: s.instructor,
  costo: numero(s.costo),
  fechaSolicitud: s.fecha_solicitud,
  estado: aMinusculas(s.estado),
});

export const listarSolicitudes = manejar(async (req, res) => {
  const filas = await consulta(
    supabase.from("solicitudes_lista").select("*").order("fecha_solicitud", { ascending: false })
  );
  res.json({ ok: true, solicitudes: filas.map(aSolicitud) });
});

export const contarPendientes = manejar(async (req, res) => {
  const { count, error } = await supabase
    .from("solicitudes_lista")
    .select("id", { count: "exact", head: true })
    .eq("estado", "PENDIENTE");
  if (error) throw error;
  res.json({ ok: true, pendientes: count ?? 0 });
});

// resolver_solicitud valida en la base el cupo maximo del instructor
export const aprobarSolicitud = manejar(async (req, res) => {
  await rpc("resolver_solicitud", { p_id: Number(req.params.id), p_estado: "APROBADA" });
  res.json({ ok: true, mensaje: "Solicitud aprobada" });
});

export const rechazarSolicitud = manejar(async (req, res) => {
  await rpc("resolver_solicitud", { p_id: Number(req.params.id), p_estado: "RECHAZADA" });
  res.json({ ok: true, mensaje: "Solicitud rechazada" });
});
