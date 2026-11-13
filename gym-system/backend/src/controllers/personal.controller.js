// ==========================================================================
// PERSONAL del gimnasio: recepcion, instructores y encargados.
// (Los CLIENTES se manejan en clientes.controller.js; no se mezclan aqui.)
// ==========================================================================
import { supabase, rpc, consulta, manejar, errorHttp, aMinusculas, aMayusculas, numero } from "../data/supabase.js";

const TEMPORAL = "Axolotl2026"; // contraseña inicial que asigna la base a personal nuevo

// Fila de la vista personal_lista -> empleado como lo usa el frontend
async function aEmpleado(p) {
  const [d] = (await rpc("detalle_personal", { p_id: p.id })) || [];
  const empleado = {
    id: p.id,
    nombre: p.nombre,
    correo: p.gmail,
    telefono: d?.r_telefono || "",
    rol: aMinusculas(p.rol),
    estado: aMinusculas(p.estado),
  };
  if (empleado.rol === "instructor") {
    empleado.costoServicio = numero(d?.r_costo);
    empleado.capacidadMaxima = numero(d?.r_max_clientes);
  }
  return empleado;
}

async function buscarEmpleado(id) {
  const [fila] = await consulta(supabase.from("personal_lista").select("*").eq("id", id).limit(1));
  return fila || null;
}

const opcional = (v) => (v === "" || v == null ? null : Number(v));

// GET /api/personal
export const listarPersonal = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("personal_lista").select("*").order("nombre"));
  res.json({ ok: true, personal: await Promise.all(filas.map(aEmpleado)) });
});

// POST /api/personal
// crear_personal crea la cuenta con la contraseña temporal; si la web manda una
// contraseña, se cambia enseguida (debe cumplir las reglas de seguridad de la base).
export const crearPersonal = manejar(async (req, res) => {
  const { nombre, telefono, correo, password, rol, costoServicio, capacidadMaxima } = req.body;
  if (!nombre || !correo || !rol) {
    return res.status(400).json({ ok: false, mensaje: "nombre, correo y rol son obligatorios" });
  }
  const id = await rpc("crear_personal", {
    p_nombre: nombre,
    p_telefono: telefono || "",
    p_gmail: correo,
    p_rol: aMayusculas(rol),
    p_costo: opcional(costoServicio),
    p_max_clientes: opcional(capacidadMaxima),
  });

  let mensaje = `Se agrego al personal. Contraseña temporal: ${TEMPORAL}`;
  if (password && password !== TEMPORAL) {
    try {
      const r = await rpc("cambiar_contrasena", { p_gmail: correo, p_actual: TEMPORAL, p_nueva: password });
      mensaje = r === "OK" ? "Se agrego al personal" : `Se agrego al personal con contraseña temporal ${TEMPORAL}. ${r}`;
    } catch (err) {
      mensaje = `Se agrego al personal con contraseña temporal ${TEMPORAL}. ${err.message}`;
    }
  }

  const fila = await buscarEmpleado(id);
  res.status(201).json({ ok: true, empleado: fila ? await aEmpleado(fila) : { id }, mensaje });
});

// PUT /api/personal/:id
export const actualizarPersonal = manejar(async (req, res) => {
  const id = Number(req.params.id);
  const actual = await buscarEmpleado(id);
  if (!actual) throw errorHttp(404, "No se encontro a esa persona del personal");

  const { nombre, correo, telefono, rol, estado, costoServicio, capacidadMaxima } = req.body;
  await rpc("editar_personal", {
    p_actor_gmail: req.usuario.correo, // quien hace el cambio (sesion iniciada)
    p_id: id,
    p_nombre: nombre || actual.nombre,
    p_gmail: correo || actual.gmail,
    p_rol: aMayusculas(rol || actual.rol),
    p_estado: aMayusculas(estado || actual.estado),
    p_telefono: telefono ?? null,
    p_costo: opcional(costoServicio),
    p_max_clientes: opcional(capacidadMaxima),
  });

  res.json({ ok: true, empleado: await aEmpleado(await buscarEmpleado(id)) });
});

// DELETE /api/personal/:id
export const eliminarPersonal = manejar(async (req, res) => {
  await rpc("eliminar_personal", { p_actor_gmail: req.usuario.correo, p_id: Number(req.params.id) });
  res.json({ ok: true, mensaje: "Se elimino del personal" });
});
