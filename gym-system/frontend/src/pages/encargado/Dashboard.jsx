import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../api/api.js";
import StatCard from "../../components/ui/StatCard.jsx";

// Paleta: tarjetas #3D3D3F · borde #93834C · dorado #AC933D · barras #AF9A54 · verde #2E8B57 · rojo #D64545
const tarjeta = "bg-[#3D3D3F] border border-[#93834C] rounded-lg p-6";
const rejilla = "rgba(147,131,76,0.25)";
const ejeProps = { stroke: "#93834C", tick: { fill: "#E3E3EC" }, fontSize: 12 };
const tooltipProps = {
  contentStyle: {
    backgroundColor: "#111111",
    border: "1px solid #93834C",
    borderRadius: 8,
    color: "#EEEEF3",
  },
  labelStyle: { color: "#AC933D", fontWeight: 600 },
  itemStyle: { color: "#EEEEF3" },
  cursor: { fill: "rgba(172,147,61,0.12)" },
};

export default function Dashboard() {
  const [resumen, setResumen] = useState({ clientesActivos: 0, clientesInactivos: 0, ingresosMes: 0 });
  const [ocupacion, setOcupacion] = useState([]);
  const [porMes, setPorMes] = useState([]);
  const [porDia, setPorDia] = useState([]);

  useEffect(() => {
    api.get("/dashboard/resumen").then((r) => setResumen(r.data.resumen));
    api.get("/dashboard/ocupacion").then((r) => setOcupacion(r.data.ocupacion));
    api.get("/dashboard/clientes-por-mes").then((r) => setPorMes(r.data.data));
    api.get("/dashboard/entradas-por-dia").then((r) => setPorDia(r.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#EEEEF3] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard titulo="Clientes activos" valor={resumen.clientesActivos} acento="green" />
        <StatCard titulo="Clientes inactivos" valor={resumen.clientesInactivos} acento="red" />
        <StatCard titulo="Ingresos del mes" valor={`$${resumen.ingresosMes}`} acento="primary" />
      </div>

      <div className={`${tarjeta} mb-6`}>
        <p className="text-sm font-medium text-[#EEEEF3] mb-4">Ocupacion por hora (personas dentro)</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={ocupacion}>
            <CartesianGrid strokeDasharray="3 3" stroke={rejilla} />
            <XAxis dataKey="hora" {...ejeProps} />
            <YAxis allowDecimals={false} {...ejeProps} />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey="personas"
              stroke="#AC933D"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#F2D675", stroke: "#AC933D" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={tarjeta}>
          <p className="text-sm font-medium text-[#EEEEF3] mb-4">Clientes activos / inactivos (12 meses)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porMes}>
              <CartesianGrid strokeDasharray="3 3" stroke={rejilla} />
              <XAxis dataKey="mes" {...ejeProps} />
              <YAxis allowDecimals={false} {...ejeProps} />
              <Tooltip {...tooltipProps} />
              <Legend wrapperStyle={{ color: "#E3E3EC" }} />
              <Bar dataKey="activos" fill="#2E8B57" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactivos" fill="#D64545" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={tarjeta}>
          <p className="text-sm font-medium text-[#EEEEF3] mb-4">Entradas por dia de la semana</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" stroke={rejilla} />
              <XAxis dataKey="dia" {...ejeProps} />
              <YAxis allowDecimals={false} {...ejeProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="entradas" fill="#AF9A54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}