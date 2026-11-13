import { supabase, consulta, manejar, errorHttp, numero } from "../data/supabase.js";

const tabla = () => supabase.from("gastos");
const aGasto = (g) => ({ ...g, monto: numero(g.monto) });

function validar({ concepto, categoria, monto, fecha }) {
  if (!concepto || !categoria || monto == null || monto === "" || !fecha) {
    throw errorHttp(400, "concepto, categoria, monto y fecha son obligatorios");
  }
  return { concepto, categoria, monto: Number(monto), fecha };
}

export const listarGastos = manejar(async (req, res) => {
  const gastos = await consulta(tabla().select("*").order("fecha", { ascending: false }));
  res.json({ ok: true, gastos: gastos.map(aGasto) });
});

export const crearGasto = manejar(async (req, res) => {
  const [gasto] = await consulta(tabla().insert(validar(req.body)).select());
  res.status(201).json({ ok: true, gasto: aGasto(gasto) });
});

export const actualizarGasto = manejar(async (req, res) => {
  const filas = await consulta(tabla().update(validar(req.body)).eq("id", Number(req.params.id)).select());
  if (!filas.length) throw errorHttp(404, "Gasto no encontrado");
  res.json({ ok: true, gasto: aGasto(filas[0]) });
});

export const eliminarGasto = manejar(async (req, res) => {
  const filas = await consulta(tabla().delete().eq("id", Number(req.params.id)).select());
  if (!filas.length) throw errorHttp(404, "Gasto no encontrado");
  res.json({ ok: true, mensaje: "Gasto eliminado" });
});
