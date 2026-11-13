import jwt from "jsonwebtoken";
import { rpc, manejar, aMinusculas } from "../data/supabase.js";

const SECRET = process.env.JWT_SECRET || "secreto_dev";

// Usa la misma funcion login_auto de la app Android: verifica la contraseña
// hasheada, el estado ACTIVO y regresa el rol principal del usuario.
async function verificar(identificador, password) {
  const filas = await rpc("login_auto", { p_gmail: identificador ?? "", p_password: password ?? "" });
  return filas?.[0] ?? null;
}

function firmar(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre, correo: usuario.correo },
    SECRET,
    { expiresIn: "8h" }
  );
}

// Login para recepcion / instructores / encargado -> correo y contraseña
export const loginStaff = manejar(async (req, res) => {
  const { correo, password } = req.body;
  const fila = await verificar(correo, password);
  if (!fila) {
    return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos" });
  }
  const rol = aMinusculas(fila.rol);
  if (rol === "cliente") {
    return res.status(403).json({ ok: false, mensaje: "Los clientes ingresan desde la app Axolotl" });
  }
  const usuario = { id: fila.id, nombre: fila.nombre, correo: fila.gmail, rol, estado: "activo" };
  res.json({ ok: true, token: firmar(usuario), usuario });
});

// Login para clientes (app) -> mismo login_auto de la base
export const loginCliente = manejar(async (req, res) => {
  const { numMembresia, correo, password } = req.body;
  const fila = await verificar(correo || numMembresia, password);
  if (!fila || aMinusculas(fila.rol) !== "cliente") {
    return res.status(401).json({ ok: false, mensaje: "Membresia o contraseña incorrectos" });
  }
  const cliente = { id: fila.id, nombre: fila.nombre, correo: fila.gmail, rol: "cliente", codigoQr: fila.codigo_qr };
  res.json({ ok: true, token: firmar(cliente), cliente });
});
