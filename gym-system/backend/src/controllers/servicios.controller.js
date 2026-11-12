import { supabase, revisar } from "../data/supabase.js";

// Tabla "servicios" (la misma que edita la app)
const tabla = () => supabase.from("servicios");
const datos = ({ nombre, duracion, precio }) => ({ nombre, duracion, precio: Number(precio) });

export async function listarServicios(req, res) {
  const servicios = revisar(await tabla().select("*").order("id"));
  res.json({ ok: true, servicios });
}

export async function crearServicio(req, res) {
  const { nombre, duracion, precio } = req.body;
  if (!nombre || !duracion || precio == null) {
    return res.status(400).json({ ok: false, mensaje: "nombre, duracion y precio son obligatorios" });
  }
  const [servicio] = revisar(await tabla().insert(datos(req.body)).select());
  res.status(201).json({ ok: true, servicio });
}

export async function actualizarServicio(req, res) {
  const filas = revisar(await tabla().update(datos(req.body)).eq("id", req.params.id).select());
  if (!filas.length) return res.status(404).json({ ok: false, mensaje: "Servicio no encontrado" });
  res.json({ ok: true, servicio: filas[0] });
}

export async function eliminarServicio(req, res) {
  revisar(await tabla().delete().eq("id", req.params.id));
  res.json({ ok: true, mensaje: "Servicio eliminado" });
}
