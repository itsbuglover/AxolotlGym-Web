import { supabase, revisar } from "../data/supabase.js";

// Tabla "gastos" (la misma que edita la app). La fecha va en formato YYYY-MM-DD.
const tabla = () => supabase.from("gastos");
const datos = ({ concepto, categoria, monto, fecha }) => ({ concepto, categoria, monto: Number(monto), fecha });

export async function listarGastos(req, res) {
  const gastos = revisar(
    await tabla().select("*").order("fecha", { ascending: false }).order("id", { ascending: false })
  );
  res.json({ ok: true, gastos });
}

export async function crearGasto(req, res) {
  const { concepto, categoria, monto, fecha } = req.body;
  if (!concepto || !categoria || monto == null || !fecha) {
    return res.status(400).json({ ok: false, mensaje: "concepto, categoria, monto y fecha son obligatorios" });
  }
  const [gasto] = revisar(await tabla().insert(datos(req.body)).select());
  res.status(201).json({ ok: true, gasto });
}

export async function actualizarGasto(req, res) {
  const filas = revisar(await tabla().update(datos(req.body)).eq("id", req.params.id).select());
  if (!filas.length) return res.status(404).json({ ok: false, mensaje: "Gasto no encontrado" });
  res.json({ ok: true, gasto: filas[0] });
}

export async function eliminarGasto(req, res) {
  revisar(await tabla().delete().eq("id", req.params.id));
  res.json({ ok: true, mensaje: "Gasto eliminado" });
}
