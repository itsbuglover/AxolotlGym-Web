import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { useIdioma } from "../../context/IdiomaContext.jsx";
import Table from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Boton from "../../components/ui/Boton.jsx";

export default function Solicitudes() {
  const { tr } = useIdioma();
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data } = await api.get("/solicitudes");
    setSolicitudes(data.solicitudes);
  }

  async function aprobar(id) {
    await api.put(`/solicitudes/${id}/aprobar`);
    cargar();
  }

  async function rechazar(id) {
    await api.put(`/solicitudes/${id}/rechazar`);
    cargar();
  }

  const columnas = [
    { key: "clienteNombre", label: tr.solicitudes.colCliente },
    { key: "instructorNombre", label: tr.solicitudes.colInstructor },
    { key: "costo", label: tr.solicitudes.colCosto, render: (f) => `$${f.costo}` },
    { key: "fechaSolicitud", label: tr.solicitudes.colFecha },
    { key: "estado", label: tr.solicitudes.colEstado, render: (f) => <Badge estado={f.estado} /> },
    {
      key: "acciones",
      label: tr.acciones,
      render: (f) =>
        f.estado === "pendiente" ? (
          <div className="flex gap-2">
            <Boton variante="exito" onClick={() => aprobar(f.id)}>{tr.solicitudes.aprobar}</Boton>
            <Boton variante="peligro" onClick={() => rechazar(f.id)}>{tr.solicitudes.rechazar}</Boton>
          </div>
        ) : (
          <span className="text-[var(--c-texto-tenue)] text-xs">{tr.solicitudes.sinAcciones}</span>
        ),
    },
  ];

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-semibold text-[var(--c-texto)]">{tr.solicitudes.titulo}</h1>
        {pendientes > 0 && (
          <span className="bg-[var(--c-rojo)] text-white text-xs rounded-full px-2 py-0.5">{pendientes}</span>
        )}
      </div>
      <Table columnas={columnas} filas={solicitudes} />
    </div>
  );
}
