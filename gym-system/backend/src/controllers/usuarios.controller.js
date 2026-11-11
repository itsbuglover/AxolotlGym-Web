import { usuarios, siguienteId } from "../data/db.js";

export function listarUsuarios(req, res) {
  const seguros = usuarios.map(({ password, ...resto }) => resto);
  res.json({ ok: true, usuarios: seguros });
}

export function crearUsuario(req, res) {
  const { nombre, telefono, correo, password, rol, estado, costoServicio, capacidadMaxima } = req.body;
  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ ok: false, mensaje: "nombre, correo, password y rol son obligatorios" });
  }
  const nuevo = {
    id: siguienteId(usuarios),
    nombre,
    telefono: telefono || "",
    correo,
    password,
    rol, // "recepcion" | "instructor"
    estado: estado || "activo",
  };
  if (rol === "instructor") {
    nuevo.costoServicio = costoServicio || 0;
    nuevo.capacidadMaxima = capacidadMaxima || 0;
    nuevo.fotoPerfil = null;
  }
  usuarios.push(nuevo);
  const { password: _pw, ...seguro } = nuevo;
  res.status(201).json({ ok: true, usuario: seguro });
}

export function actualizarUsuario(req, res) {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
  Object.assign(usuario, req.body);
  const { password, ...seguro } = usuario;
  res.json({ ok: true, usuario: seguro });
}

export function eliminarUsuario(req, res) {
  const idx = usuarios.findIndex((u) => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
  usuarios.splice(idx, 1);
  res.json({ ok: true, mensaje: "Usuario eliminado" });
}
