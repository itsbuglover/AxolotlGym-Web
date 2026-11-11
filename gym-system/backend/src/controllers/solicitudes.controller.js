import { solicitudes, asesorias, siguienteId } from "../data/db.js";

export function listarSolicitudes(req, res) {
  res.json({ ok: true, solicitudes });
}

export function contarPendientes(req, res) {
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
  res.json({ ok: true, pendientes });
}

export function aprobarSolicitud(req, res) {
  const solicitud = solicitudes.find((s) => s.id === Number(req.params.id));
  if (!solicitud) return res.status(404).json({ ok: false, mensaje: "Solicitud no encontrada" });
  solicitud.estado = "aprobada";
  solicitud.leida = true;

  asesorias.push({
    id: siguienteId(asesorias),
    clienteId: solicitud.clienteId,
    instructorId: solicitud.instructorId,
    estado: "aprobada",
    dias: [],
    objetivo: "",
    costo: solicitud.costo,
    fechaSolicitud: solicitud.fechaSolicitud,
  });

  res.json({ ok: true, solicitud, mensaje: "Solicitud aprobada" });
}

export function rechazarSolicitud(req, res) {
  const solicitud = solicitudes.find((s) => s.id === Number(req.params.id));
  if (!solicitud) return res.status(404).json({ ok: false, mensaje: "Solicitud no encontrada" });
  solicitud.estado = "rechazada";
  solicitud.leida = true;
  res.json({ ok: true, solicitud, mensaje: "Solicitud rechazada" });
}
