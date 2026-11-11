import { useEffect, useState } from "react";
import api from "../../api/api.js";
import Table from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Boton from "../../components/ui/Boton.jsx";

export default function Solicitudes() {
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
    { key: "clienteNombre", label: "Cliente" },
    { key: "instructorNombre", label: "Instructor" },
    { key: "costo", label: "Costo", render: (f) => `$${f.costo}` },
    { key: "fechaSolicitud", label: "Fecha" },
    { key: "estado", label: "Estado", render: (f) => <Badge estado={f.estado} /> },
    {
      key: "acciones",
      label: "Acciones",
      render: (f) =>
        f.estado === "pendiente" ? (
          <div className="flex gap-2">
            <Boton variante="exito" onClick={() => aprobar(f.id)}>Aprobar</Boton>
            <Boton variante="peligro" onClick={() => rechazar(f.id)}>Rechazar</Boton>
          </div>
        ) : (
          <span className="text-[#E3E3EC]/60 text-xs">Sin acciones</span>
        ),
    },
  ];

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-semibold text-[#EEEEF3]">Solicitudes</h1>
        {pendientes > 0 && (
          <span className="bg-[#D64545] text-white text-xs rounded-full px-2 py-0.5">{pendientes}</span>
        )}
      </div>
      <Table columnas={columnas} filas={solicitudes} />
    </div>
  );
}