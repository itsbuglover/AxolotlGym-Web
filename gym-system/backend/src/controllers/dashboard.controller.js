import { clientes, entradas, gastos, servicios, asesorias } from "../data/db.js";

export function resumenDashboard(req, res) {
  const activos = clientes.filter((c) => c.estado === "activo").length;
  const inactivos = clientes.filter((c) => c.estado === "inactivo").length;

  const mesActual = new Date().toISOString().slice(0, 7);
  const ingresosServicios = 0; // conecta con tus pagos/renovaciones reales
  const ingresosAsesorias = asesorias
    .filter((a) => a.fechaSolicitud.startsWith(mesActual))
    .reduce((sum, a) => sum + (a.costo || 0), 0);
  const gastosDelMes = gastos
    .filter((g) => g.fecha.startsWith(mesActual))
    .reduce((sum, g) => sum + g.monto, 0);
  const ingresosMes = ingresosServicios + ingresosAsesorias - gastosDelMes;

  res.json({
    ok: true,
    resumen: {
      clientesActivos: activos,
      clientesInactivos: inactivos,
      ingresosMes,
    },
  });
}

// Ocupacion por hora (usado en home de recepcion/cliente y dashboard de dueño)
export function ocupacionPorHora(req, res) {
  const conteoPorHora = {};
  entradas.forEach((e) => {
    conteoPorHora[e.hora] = (conteoPorHora[e.hora] || 0) + 1;
  });
  const horas = Array.from({ length: 15 }, (_, i) => i + 6); // 6am - 8pm, ajusta a tu horario real
  const data = horas.map((h) => ({ hora: `${h}:00`, personas: conteoPorHora[h] || 0 }));
  res.json({ ok: true, ocupacion: data });
}

// Clientes activos/inactivos por mes (12 meses) - datos de ejemplo
export function clientesPorMes(req, res) {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const data = meses.map((m) => ({
    mes: m,
    activos: Math.floor(Math.random() * 40) + 20, // TODO: sustituir por conteo real historico
    inactivos: Math.floor(Math.random() * 15) + 5,
  }));
  res.json({ ok: true, data });
}

// Entradas por dia de la semana - datos de ejemplo
export function entradasPorDia(req, res) {
  const dias = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const data = dias.map((d) => ({ dia: d, entradas: Math.floor(Math.random() * 60) + 10 }));
  res.json({ ok: true, data });
}
