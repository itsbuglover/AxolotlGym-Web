import { supabase, revisar, rpc, aWeb, aBd } from "../data/supabase.js";

const PASSWORD_TEMPORAL = "Axolotl2026"; // la que pone crear_personal en la base

// personal_lista no trae telefono/costo/capacidad: se completan con detalle_personal
async function aUsuario(p) {
  const det = (await rpc("detalle_personal", { p_id: p.id }))?.[0] || {};
  return {
    id: p.id,
    nombre: p.nombre,
    correo: p.gmail,
    telefono: det.r_telefono || "",
    rol: aWeb(p.rol),
    estado: aWeb(p.estado),
    costoServicio: det.r_costo ?? null,
    capacidadMaxima: det.r_max_clientes ?? null,
  };
}

export async function listarUsuarios(req, res) {
  const filas = revisar(await supabase.from("personal_lista").select("*").order("id"));
  const usuarios = await Promise.all(filas.map(aUsuario));
  res.json({ ok: true, usuarios });
}

export async function crearUsuario(req, res) {
  const { nombre, telefono, correo, password, rol, estado, costoServicio, capacidadMaxima } = req.body;
  if (!nombre || !correo || !rol) {
    return res.status(400).json({ ok: false, mensaje: "nombre, correo y rol son obligatorios" });
  }
  const esInstructor = rol === "instructor";
  const id = await rpc("crear_personal", {
    p_nombre: nombre,
    p_telefono: telefono || "",
    p_gmail: correo,
    p_rol: aBd(rol),
    p_costo: esInstructor ? Number(costoServicio) || 0 : null,
    p_max_clientes: esInstructor ? Number(capacidadMaxima) || 10 : null,
  });

  // crear_personal siempre lo da de alta ACTIVO
  if (estado === "inactivo") {
    await rpc("editar_personal", {
      p_actor_gmail: req.usuario.gmail, p_id: id, p_nombre: nombre, p_gmail: correo,
      p_rol: aBd(rol), p_estado: "INACTIVO",
    });
  }

  // Cambia la contraseña temporal por la que escribio el encargado
  let mensaje = "Usuario creado";
  if (password) {
    const r = await rpc("cambiar_contrasena", { p_gmail: correo, p_actual: PASSWORD_TEMPORAL, p_nueva: password });
    if (r !== "OK") mensaje = `Usuario creado, pero no se pudo asignar la contraseña (${r}). Su contraseña es ${PASSWORD_TEMPORAL}`;
  } else {
    mensaje = `Usuario creado con la contraseña temporal ${PASSWORD_TEMPORAL}`;
  }
  res.status(201).json({ ok: true, usuario: { id }, mensaje });
}

export async function actualizarUsuario(req, res) {
  const { nombre, telefono, correo, rol, estado, costoServicio, capacidadMaxima } = req.body;
  const esInstructor = rol === "instructor";
  await rpc("editar_personal", {
    p_actor_gmail: req.usuario.gmail,
    p_id: Number(req.params.id),
    p_nombre: nombre,
    p_gmail: correo,
    p_rol: aBd(rol),
    p_estado: aBd(estado || "activo"),
    p_telefono: telefono ?? null,
    p_costo: esInstructor && costoServicio !== "" && costoServicio != null ? Number(costoServicio) : null,
    p_max_clientes: esInstructor && capacidadMaxima !== "" && capacidadMaxima != null ? Number(capacidadMaxima) : null,
  });
  res.json({ ok: true, mensaje: "Usuario actualizado" });
}

export async function eliminarUsuario(req, res) {
  await rpc("eliminar_personal", { p_actor_gmail: req.usuario.gmail, p_id: Number(req.params.id) });
  res.json({ ok: true, mensaje: "Usuario eliminado" });
}
