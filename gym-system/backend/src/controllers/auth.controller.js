import jwt from "jsonwebtoken";
import { rpc, aWeb } from "../data/supabase.js";

const SECRET = process.env.JWT_SECRET || "secreto_dev";

// Roles que pueden entrar a la web (en la base: RECEPCION / ENCARGADO)
const ROLES_WEB = ["recepcion", "encargado"];

function firmar(u) {
  // gmail viaja en el token porque las funciones de la base lo piden como "actor"
  return jwt.sign({ id: u.id, rol: u.rol, nombre: u.nombre, gmail: u.correo }, SECRET, { expiresIn: "8h" });
}

// Login de staff con correo y contraseña. Usa la misma funcion login_auto que la app:
// valida la contraseña (bcrypt en la base), bloquea tras 5 intentos y regresa el rol.
export async function loginStaff(req, res) {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ ok: false, mensaje: "Correo y contraseña son obligatorios" });
  }

  const filas = await rpc("login_auto", { p_gmail: correo.trim(), p_password: password });
  const fila = filas?.[0];
  if (!fila) {
    return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos" });
  }

  const usuario = { id: fila.id, nombre: fila.nombre, correo: fila.gmail, rol: aWeb(fila.rol) };
  if (!ROLES_WEB.includes(usuario.rol)) {
    return res.status(403).json({
      ok: false,
      mensaje: "Este acceso web es solo para recepción y encargado. Usa la app móvil.",
    });
  }
  res.json({ ok: true, token: firmar(usuario), usuario });
}

// Login de clientes (por si algun dia la app usa esta API en vez de Supabase directo)
export async function loginCliente(req, res) {
  const { correo, password } = req.body;
  const filas = await rpc("login", { p_gmail: (correo || "").trim(), p_password: password || "", p_rol: "CLIENTE" });
  const fila = filas?.[0];
  if (!fila) return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos" });
  const cliente = { id: fila.id, nombre: fila.nombre, correo: fila.gmail, rol: "cliente", codigoQr: fila.codigo_qr };
  res.json({ ok: true, token: firmar(cliente), cliente });
}
