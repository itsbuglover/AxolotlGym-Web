import { supabase, revisar } from "../data/supabase.js";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]; // isodow 1..7

// Vista resumen_dashboard: clientes activos/inactivos e ingresos netos del mes (pagos aceptados - reembolsos)
export async function resumenDashboard(req, res) {
  const [r] = revisar(await supabase.from("resumen_dashboard").select("*"));
  res.json({
    ok: true,
    resumen: {
      clientesActivos: r?.activos ?? 0,
      clientesInactivos: r?.inactivos ?? 0,
      ingresosMes: Number(r?.ingresos_mes) || 0,
    },
  });
}

// Vista ocupacion_por_hora (entradas de hoy). Se rellenan con 0 las horas sin entradas (06:00 - 23:00).
export async function ocupacionPorHora(req, res) {
  const filas = revisar(await supabase.from("ocupacion_por_hora").select("*"));
  const porHora = Object.fromEntries(filas.map((f) => [f.hora, f.personas]));
  const ocupacion = Array.from({ length: 18 }, (_, i) => {
    const hora = `${String(i + 6).padStart(2, "0")}:00`;
    return { hora, personas: porHora[hora] || 0 };
  });
  res.json({ ok: true, ocupacion });
}

// Vista clientes_por_mes: ultimos 12 meses ("2026-09" -> "Sep")
export async function clientesPorMes(req, res) {
  const filas = revisar(await supabase.from("clientes_por_mes").select("*").order("periodo"));
  const data = filas.map((f) => ({
    mes: MESES[Number(f.periodo.slice(5, 7)) - 1],
    periodo: f.periodo,
    activos: f.activos,
    inactivos: f.inactivos,
  }));
  res.json({ ok: true, data });
}

// Vista afluencia_semanal: promedio de entradas por dia/hora de los ultimos 28 dias.
// Se suman las horas de cada dia para obtener el promedio de entradas por dia de la semana.
export async function entradasPorDia(req, res) {
  const filas = revisar(await supabase.from("afluencia_semanal").select("*"));
  const totales = [0, 0, 0, 0, 0, 0, 0];
  filas.forEach((f) => (totales[f.dia_semana - 1] += Number(f.promedio) || 0));
  const data = DIAS.map((dia, i) => ({ dia, entradas: Math.round(totales[i] * 10) / 10 }));
  res.json({ ok: true, data });
}
