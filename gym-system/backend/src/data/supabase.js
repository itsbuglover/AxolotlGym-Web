// ==========================================================================
// Conexion a Supabase (la misma base de datos que usa la app Android).
// Las variables SUPABASE_URL y SUPABASE_KEY van en el .env local y en
// las Environment Variables de Render. Nunca se suben al repositorio.
// ==========================================================================
import { createClient } from "@supabase/supabase-js";

// trim(): quita espacios o saltos de linea que se cuelan al pegar las llaves en Render
const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || "").trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Faltan SUPABASE_URL y/o SUPABASE_KEY. Agregalas al .env (local) o a las Environment Variables de Render."
  );
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Error con codigo HTTP para que el manejador de server.js responda bien
export function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

// Convierte el error de Supabase/Postgres en un mensaje entendible.
// Los "raise exception" de las funciones SQL llegan en error.message.
function errorDeSupabase(error) {
  const esDeNegocio = error.code === "P0001"; // raise exception en plpgsql
  return errorHttp(esDeNegocio ? 400 : 500, error.message || "Error en la base de datos");
}

// Llama una funcion SQL (RPC) y regresa sus datos o lanza el error
export async function rpc(nombre, params = {}) {
  const { data, error } = await supabase.rpc(nombre, params);
  if (error) throw errorDeSupabase(error);
  return data;
}

// Ejecuta una consulta del query builder y regresa sus datos o lanza el error
export async function consulta(promesa) {
  const { data, error } = await promesa;
  if (error) throw errorDeSupabase(error);
  return data;
}

// Envuelve controladores async para que los errores lleguen a server.js
export const manejar = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---- Conversiones entre la base (MAYUSCULAS) y el frontend (minusculas) ----
export const aMinusculas = (v) => (v ? String(v).toLowerCase() : v);
export const aMayusculas = (v) => (v ? String(v).toUpperCase() : v);
export const numero = (v) => (v == null ? 0 : Number(v));
