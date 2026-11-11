import { gastos, siguienteId } from "../data/db.js";

export function listarGastos(req, res) {
  res.json({ ok: true, gastos });
}

export function crearGasto(req, res) {
  const { concepto, categoria, monto, fecha } = req.body;
  if (!concepto || !categoria || monto == null || !fecha) {
    return res.status(400).json({ ok: false, mensaje: "concepto, categoria, monto y fecha son obligatorios" });
  }
  const nuevo = { id: siguienteId(gastos), concepto, categoria, monto, fecha };
  gastos.push(nuevo);
  res.status(201).json({ ok: true, gasto: nuevo });
}

export function actualizarGasto(req, res) {
  const gasto = gastos.find((g) => g.id === Number(req.params.id));
  if (!gasto) return res.status(404).json({ ok: false, mensaje: "Gasto no encontrado" });
  Object.assign(gasto, req.body);
  res.json({ ok: true, gasto });
}

export function eliminarGasto(req, res) {
  const idx = gastos.findIndex((g) => g.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, mensaje: "Gasto no encontrado" });
  gastos.splice(idx, 1);
  res.json({ ok: true, mensaje: "Gasto eliminado" });
}
