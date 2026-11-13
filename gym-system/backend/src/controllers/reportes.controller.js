import { supabase, consulta, manejar, numero } from "../data/supabase.js";

// Reporte de los ultimos 6 meses (vista reporte_mensual, la misma de la app)
export const listarReportes = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("reporte_mensual").select("*"));
  const reportes = filas
    .map((f) => {
      const servicio = numero(f.servicios);
      const asesorias = numero(f.asesorias);
      const gastos = numero(f.gastos);
      return { id: f.periodo, periodo: f.periodo, servicio, asesorias, gastos, total: servicio + asesorias - gastos };
    })
    .sort((a, b) => (a.periodo < b.periodo ? 1 : -1));
  res.json({ ok: true, reportes });
});
