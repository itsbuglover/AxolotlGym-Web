import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { useIdioma } from "../../context/IdiomaContext.jsx";
import Table from "../../components/ui/Table.jsx";

export default function Reportes() {
  const { tr } = useIdioma();
  const [reportes, setReportes] = useState([]);

  // "2026-01" (o "2026-01-15") -> "Enero 2026" / "January 2026"
  function formatearPeriodo(periodo) {
    const m = /^(\d{4})-(\d{2})/.exec(String(periodo));
    if (!m) return periodo;
    const nombreMes = tr.reportes.meses[Number(m[2]) - 1];
    return nombreMes ? `${nombreMes} ${m[1]}` : periodo;
  }

  useEffect(() => {
    api.get("/reportes").then((r) => setReportes(r.data.reportes));
  }, []);

  const columnas = [
    { key: "periodo", label: tr.reportes.colPeriodo, render: (f) => formatearPeriodo(f.periodo) },
    { key: "servicio", label: tr.reportes.colServicio, render: (f) => `$${f.servicio}` },
    { key: "asesorias", label: tr.reportes.colAsesorias, render: (f) => `$${f.asesorias}` },
    { key: "gastos", label: tr.reportes.colGastos, render: (f) => `$${f.gastos}` },
    { key: "total", label: tr.reportes.colTotal, render: (f) => `$${f.total}` },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">{tr.reportes.titulo}</h1>
      <Table columnas={columnas} filas={reportes} />
    </div>
  );
}
