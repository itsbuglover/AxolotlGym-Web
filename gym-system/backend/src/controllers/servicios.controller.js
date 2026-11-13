import { supabase, consulta, manejar, errorHttp, numero } from "../data/supabase.js";

const tabla = () => supabase.from("servicios");
const aServicio = (s) => ({ ...s, precio: numero(s.precio) });

function validar({ nombre, duracion, precio }) {
  if (!nombre || !duracion || precio == null || precio === "") {
    throw errorHttp(400, "nombre, duracion y precio son obligatorios");
  }
  return { nombre, duracion: String(duracion), precio: Number(precio) };
}

export const listarServicios = manejar(async (req, res) => {
  const servicios = await consulta(tabla().select("*").order("nombre"));
  res.json({ ok: true, servicios: servicios.map(aServicio) });
});

export const crearServicio = manejar(async (req, res) => {
  const [servicio] = await consulta(tabla().insert(validar(req.body)).select());
  res.status(201).json({ ok: true, servicio: aServicio(servicio) });
});

export const actualizarServicio = manejar(async (req, res) => {
  const filas = await consulta(tabla().update(validar(req.body)).eq("id", Number(req.params.id)).select());
  if (!filas.length) throw errorHttp(404, "Servicio no encontrado");
  res.json({ ok: true, servicio: aServicio(filas[0]) });
});

export const eliminarServicio = manejar(async (req, res) => {
  const filas = await consulta(tabla().delete().eq("id", Number(req.params.id)).select());
  if (!filas.length) throw errorHttp(404, "Servicio no encontrado");
  res.json({ ok: true, mensaje: "Servicio eliminado" });
});
