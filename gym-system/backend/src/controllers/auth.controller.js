import jwt from "jsonwebtoken";
import { usuarios, clientes } from "../data/db.js";

const SECRET = process.env.JWT_SECRET || "secreto_dev";

// Login para recepcion / instructores / encargado / dueno -> correo y contraseña
export function loginStaff(req, res) {
  const { correo, password } = req.body;
  const usuario = usuarios.find((u) => u.correo === correo && u.password === password);
  if (!usuario) {
    return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos" });
  }
  if (usuario.estado === "inactivo") {
    return res.status(403).json({ ok: false, mensaje: "Tu cuenta esta inactiva, contacta al administrador" });
  }
  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    SECRET,
    { expiresIn: "8h" }
  );
  const { password: _pw, ...usuarioSeguro } = usuario;
  res.json({ ok: true, token, usuario: usuarioSeguro });
}

// Login para clientes (app Android) -> num. membresia y contraseña
export function loginCliente(req, res) {
  const { numMembresia, password } = req.body;
  const cliente = clientes.find((c) => c.numMembresia === numMembresia && c.password === password);
  if (!cliente) {
    return res.status(401).json({ ok: false, mensaje: "Membresia o contraseña incorrectos" });
  }
  const token = jwt.sign(
    { id: cliente.id, rol: "cliente", nombre: cliente.nombre },
    SECRET,
    { expiresIn: "8h" }
  );
  const { password: _pw, ...clienteSeguro } = cliente;
  res.json({ ok: true, token, cliente: clienteSeguro });
}
