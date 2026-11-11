import { servicios, siguienteId } from "../data/db.js";

export function listarServicios(req, res) {
  res.json({ ok: true, servicios });
}

export function crearServicio(req, res) {
  const { nombre, duracion, precio } = req.body;
  if (!nombre || !duracion || precio == null) {
    return res.status(400).json({ ok: false, mensaje: "nombre, duracion y precio son obligatorios" });
  }
  const nuevo = { id: siguienteId(servicios), nombre, duracion, precio };
  servicios.push(nuevo);
  res.status(201).json({ ok: true, servicio: nuevo });
}

export function actualizarServicio(req, res) {
  const servicio = servicios.find((s) => s.id === Number(req.params.id));
  if (!servicio) return res.status(404).json({ ok: false, mensaje: "Servicio no encontrado" });
  Object.assign(servicio, req.body);
  res.json({ ok: true, servicio });
}

export function eliminarServicio(req, res) {
  const idx = servicios.findIndex((s) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, mensaje: "Servicio no encontrado" });
  servicios.splice(idx, 1);
  res.json({ ok: true, mensaje: "Servicio eliminado" });
}
