import { supabase, revisar } from "../data/supabase.js";

// Vista reporte_mensual (ultimos 6 meses): ingresos por membresias (pagos), asesorias aprobadas y gastos
export async function listarReportes(req, res) {
  const filas = revisar(await supabase.from("reporte_mensual").select("*").order("periodo", { ascending: false }));
  const reportes = filas.map((r) => {
    const servicio = Number(r.servicios) || 0;
    const asesorias = Number(r.asesorias) || 0;
    const gastos = Number(r.gastos) || 0;
    return { periodo: r.periodo, servicio, asesorias, gastos, total: Math.round((servicio + asesorias - gastos) * 100) / 100 };
  });
  res.json({ ok: true, reportes });
}
