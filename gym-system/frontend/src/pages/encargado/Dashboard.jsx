import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../api/api.js";
import { useIdioma } from "../../context/IdiomaContext.jsx";
import StatCard from "../../components/ui/StatCard.jsx";

const tarjeta = "bg-[var(--c-tarjeta)] border border-[var(--c-borde)] rounded-lg p-6";
const rejilla = "var(--c-rejilla)";
const ejeProps = { stroke: "var(--c-borde)", tick: { fill: "var(--c-texto-sec)" }, fontSize: 12 };
const tooltipProps = {
  contentStyle: {
    backgroundColor: "var(--c-tooltip)",
    border: "1px solid var(--c-borde)",
    borderRadius: 8,
    color: "var(--c-texto)",
  },
  labelStyle: { color: "var(--c-acento)", fontWeight: 600 },
  itemStyle: { color: "var(--c-texto)" },
  cursor: { fill: "var(--c-borde-20)" },
};

export default function Dashboard() {
  const { tr } = useIdioma();
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

  const porMesTraducido = porMes.map((item) => ({
    ...item,
    mes: tr.dashboard.mesesCortos[item.mes] || item.mes,
  }));

  const porDiaTraducido = porDia.map((item) => ({
    ...item,
    dia: tr.dashboard.diasCortos[item.dia] || item.dia,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--c-texto)] mb-6">{tr.dashboard.titulo}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard titulo={tr.dashboard.clientesActivos} valor={resumen.clientesActivos} acento="green" />
        <StatCard titulo={tr.dashboard.clientesInactivos} valor={resumen.clientesInactivos} acento="red" />
        <StatCard titulo={tr.dashboard.ingresosMes} valor={`$${resumen.ingresosMes}`} acento="primary" />
      </div>

      <div className={`${tarjeta} mb-6`}>
        <p className="text-sm font-medium text-[var(--c-texto)] mb-4">{tr.dashboard.ocupacionHora}</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={ocupacion}>
            <CartesianGrid strokeDasharray="3 3" stroke={rejilla} />
            <XAxis dataKey="hora" {...ejeProps} />
            <YAxis allowDecimals={false} {...ejeProps} />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey="personas"
              name={tr.dashboard.personas}
              stroke="var(--c-acento)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "var(--c-acento-texto)", stroke: "var(--c-acento)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={tarjeta}>
          <p className="text-sm font-medium text-[var(--c-texto)] mb-4">{tr.dashboard.clientes12Meses}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porMesTraducido}>
              <CartesianGrid strokeDasharray="3 3" stroke={rejilla} />
              <XAxis dataKey="mes" {...ejeProps} />
              <YAxis allowDecimals={false} {...ejeProps} />
              <Tooltip {...tooltipProps} />
              <Legend wrapperStyle={{ color: "var(--c-texto-sec)" }} />
              <Bar dataKey="activos" name={tr.dashboard.activos} fill="var(--c-verde)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactivos" name={tr.dashboard.inactivos} fill="var(--c-rojo)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={tarjeta}>
          <p className="text-sm font-medium text-[var(--c-texto)] mb-4">{tr.dashboard.entradasDia}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porDiaTraducido}>
              <CartesianGrid strokeDasharray="3 3" stroke={rejilla} />
              <XAxis dataKey="dia" {...ejeProps} />
              <YAxis allowDecimals={false} {...ejeProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="entradas" name={tr.dashboard.entradas} fill="var(--c-barras)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
