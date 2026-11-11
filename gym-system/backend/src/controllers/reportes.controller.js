import { asesorias, gastos } from "../data/db.js";

// Reporte mensual: periodo (mes/año), servicio, asesorias, gastos, total
// Esto es un CALCULO DE EJEMPLO sobre datos mock; sustituye por tus queries reales agrupando por mes.
export function listarReportes(req, res) {
  const meses = {};

  gastos.forEach((g) => {
    const periodo = g.fecha.slice(0, 7); // "YYYY-MM"
    meses[periodo] = meses[periodo] || { periodo, servicio: 0, asesorias: 0, gastos: 0 };
    meses[periodo].gastos += g.monto;
  });

  asesorias.forEach((a) => {
    const periodo = a.fechaSolicitud.slice(0, 7);
    meses[periodo] = meses[periodo] || { periodo, servicio: 0, asesorias: 0, gastos: 0 };
    meses[periodo].asesorias += a.costo || 0;
  });

  const reportes = Object.values(meses)
    .map((m) => ({
      ...m,
      total: m.servicio + m.asesorias - m.gastos,
    }))
    .sort((a, b) => (a.periodo < b.periodo ? 1 : -1));

  res.json({ ok: true, reportes });
}
