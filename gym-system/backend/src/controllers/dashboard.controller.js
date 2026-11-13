import { supabase, consulta, manejar, numero } from "../data/supabase.js";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DIAS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]; // dia_semana 1..7 (ISO)

// Tarjetas del dashboard (vista resumen_dashboard)
export const resumenDashboard = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("resumen_dashboard").select("*").limit(1));
  const r = filas?.[0] || {};
  res.json({
    ok: true,
    resumen: {
      clientesActivos: numero(r.activos),
      clientesInactivos: numero(r.inactivos),
      ingresosMes: numero(r.ingresos_mes),
    },
  });
});

// Ocupacion de hoy por hora (vista ocupacion_por_hora), rellenando horas sin gente
export const ocupacionPorHora = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("ocupacion_por_hora").select("*"));
  const porHora = Object.fromEntries(filas.map((f) => [parseInt(f.hora, 10), numero(f.personas)]));
  const data = Array.from({ length: 18 }, (_, i) => i + 6).map((h) => ({
    hora: `${h}:00`,
    personas: porHora[h] || 0,
  }));
  res.json({ ok: true, ocupacion: data });
});

// Clientes activos / inactivos de los ultimos 12 meses (vista clientes_por_mes)
export const clientesPorMes = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("clientes_por_mes").select("*").order("periodo"));
  const data = filas.map((f) => ({
    mes: MESES[parseInt(f.periodo.slice(5, 7), 10) - 1],
    periodo: f.periodo,
    activos: numero(f.activos),
    inactivos: numero(f.inactivos),
  }));
  res.json({ ok: true, data });
});

// Promedio de entradas por dia de la semana, ultimas 4 semanas (vista afluencia_semanal)
export const entradasPorDia = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("afluencia_semanal").select("dia_semana, promedio"));
  const totales = Array(7).fill(0);
  filas.forEach((f) => {
    totales[f.dia_semana - 1] += numero(f.promedio);
  });
  const data = DIAS.map((dia, i) => ({ dia, entradas: Math.round(totales[i]) }));
  res.json({ ok: true, data });
});
