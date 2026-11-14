import { rpc, manejar, errorHttp, numero } from "../data/supabase.js";

const aGasto = (g) => ({ ...g, monto: numero(g.monto) });

function validar({ concepto, categoria, monto, fecha }) {
  if (!concepto || !categoria || monto == null || monto === "" || !fecha) {
    throw errorHttp(400, "concepto, categoria, monto y fecha son obligatorios");
  }
  return { concepto, categoria, monto: Number(monto), fecha };
}

export const listarGastos = manejar(async (req, res) => {
  const gastos = (await rpc("listar_gastos", { p_actor_gmail: req.usuario.correo })) || [];
  res.json({ ok: true, gastos: gastos.map(aGasto) });
});

export const crearGasto = manejar(async (req, res) => {
  const d = validar(req.body);
  const id = await rpc("crear_gasto", {
    p_actor_gmail: req.usuario.correo,
    p_concepto: d.concepto,
    p_categoria: d.categoria,
    p_monto: d.monto,
    p_fecha: d.fecha,
  });
  res.status(201).json({ ok: true, gasto: aGasto({ id, ...d }) });
});

export const actualizarGasto = manejar(async (req, res) => {
  const id = Number(req.params.id);
  const d = validar(req.body);
  await rpc("actualizar_gasto", {
    p_actor_gmail: req.usuario.correo,
    p_id: id,
    p_concepto: d.concepto,
    p_categoria: d.categoria,
    p_monto: d.monto,
    p_fecha: d.fecha,
  });
  res.json({ ok: true, gasto: aGasto({ id, ...d }) });
});

export const eliminarGasto = manejar(async (req, res) => {
  await rpc("eliminar_gasto", {
    p_actor_gmail: req.usuario.correo,
    p_id: Number(req.params.id),
  });
  res.json({ ok: true, mensaje: "Gasto eliminado" });
});
