// ==========================================================================
// Conexion a la MISMA base de datos de Supabase que usa la app Android.
// Usa las mismas vistas (clientes_lista, personal_lista, ...) y funciones RPC
// (login_auto, crear_cliente, renovar_membresia, ...) para que la web y la app
// siempre vean y guarden los mismos datos.
// ==========================================================================
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan SUPABASE_URL y SUPABASE_KEY en backend/.env (usa los mismos valores de local.properties de la app Android)"
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Lanza el error de Supabase con status 400 y el mensaje que manda la base
// (ej. "Ese correo ya está registrado") para que el front lo muestre tal cual.
export function revisar({ data, error }) {
  if (error) {
    const e = new Error(error.message || "Error en la base de datos");
    e.status = 400;
    throw e;
  }
  return data;
}

export const rpc = async (fn, params) => revisar(await supabase.rpc(fn, params));

// Express 4 no atrapa errores de funciones async: este envoltorio los pasa al manejador de errores
export const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---- Conversiones entre la forma de la base y la que usa el frontend ----
// Base: "ACTIVO" / "RECEPCION" / "PENDIENTE"   ·   Web: "activo" / "recepcion" / "pendiente"
export const aWeb = (v) => (v == null ? v : String(v).toLowerCase());
export const aBd = (v) => (v == null ? v : String(v).toUpperCase());
