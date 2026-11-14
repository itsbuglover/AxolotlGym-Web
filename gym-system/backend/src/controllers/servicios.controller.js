import { supabase, rpc, consulta, manejar, errorHttp, numero } from "../data/supabase.js";

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
  const d = validar(req.body);
  const id = await rpc("crear_servicio", {
    p_actor_gmail: req.usuario.correo,
    p_nombre: d.nombre,
    p_duracion: d.duracion,
    p_precio: d.precio,
  });
  res.status(201).json({ ok: true, servicio: aServicio({ id, ...d }) });
});

export const actualizarServicio = manejar(async (req, res) => {
  const id = Number(req.params.id);
  const d = validar(req.body);
  await rpc("actualizar_servicio", {
    p_actor_gmail: req.usuario.correo,
    p_id: id,
    p_nombre: d.nombre,
    p_duracion: d.duracion,
    p_precio: d.precio,
  });
  res.json({ ok: true, servicio: aServicio({ id, ...d }) });
});

export const eliminarServicio = manejar(async (req, res) => {
  await rpc("eliminar_servicio", {
    p_actor_gmail: req.usuario.correo,
    p_id: Number(req.params.id),
  });
  res.json({ ok: true, mensaje: "Servicio eliminado" });
});
