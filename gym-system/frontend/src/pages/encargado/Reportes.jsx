import { useEffect, useState } from "react";
import api from "../../api/api.js";
import Table from "../../components/ui/Table.jsx";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// "2026-01" (o "2026-01-15") -> "Enero 2026". Si el formato no coincide, lo deja como llega.
function formatearPeriodo(periodo) {
  const m = /^(\d{4})-(\d{2})/.exec(String(periodo));
  if (!m) return periodo;
  const nombreMes = MESES[Number(m[2]) - 1];
  return nombreMes ? `${nombreMes} ${m[1]}` : periodo;
}

export default function Reportes() {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    api.get("/reportes").then((r) => setReportes(r.data.reportes));
  }, []);

  const columnas = [
    { key: "periodo", label: "Periodo", render: (f) => formatearPeriodo(f.periodo) },
    { key: "servicio", label: "Servicio", render: (f) => `$${f.servicio}` },
    { key: "asesorias", label: "Asesorias", render: (f) => `$${f.asesorias}` },
    { key: "gastos", label: "Gastos", render: (f) => `$${f.gastos}` },
    { key: "total", label: "Total", render: (f) => `$${f.total}` },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">Reportes mensuales</h1>
      <Table columnas={columnas} filas={reportes} />
    </div>
  );
}