import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import BotonTema from "../ui/BotonTema.jsx";

const menuPorRol = {
  recepcion: [
    { to: "/recepcion", label: "Escanear QR", fin: true },
    { to: "/recepcion/clientes", label: "Clientes" },
    { to: "/recepcion/solicitudes", label: "Solicitudes" },
  ],
  encargado: [
    { to: "/encargado", label: "Dashboard", fin: true },
    { to: "/encargado/clientes", label: "Clientes" },
    { to: "/encargado/personal", label: "Personal" },
    { to: "/encargado/servicios", label: "Servicios" },
    { to: "/encargado/gastos", label: "Gastos" },
    { to: "/encargado/reportes", label: "Reportes" },
  ],
  dueno: [
    { to: "/encargado", label: "Dashboard", fin: true },
    { to: "/encargado/clientes", label: "Clientes" },
    { to: "/encargado/personal", label: "Personal" },
    { to: "/encargado/servicios", label: "Servicios" },
    { to: "/encargado/gastos", label: "Gastos" },
    { to: "/encargado/reportes", label: "Reportes" },
  ],
};

const etiquetaRol = {
  recepcion: "Recepción",
  encargado: "Encargado",
  dueno: "Dueño",
};

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const items = menuPorRol[usuario?.rol] || [];
  const inicial = (usuario?.nombre || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex shrink-0">
      <aside className="w-64 bg-[var(--c-barra)] flex flex-col">
        {/* Encabezado: logo, nombre y rol */}
        <div className="px-5 pt-6 pb-5 flex flex-col items-center">
          <img src="/logo_final.png" alt="Axolotl" className="w-28 h-28 object-contain" />
          <p className="mt-3 text-lg font-bold tracking-[0.3em] text-[var(--c-texto)]">AXOLOTL</p>
          <span className="mt-2 px-3.5 py-1 rounded-full border border-[var(--c-acento)] bg-[var(--c-acento-15)] text-xs font-bold text-[var(--c-acento)]">
            {etiquetaRol[usuario?.rol] || usuario?.rol}
          </span>
        </div>

        <div className="mx-5 h-[1.5px] bg-gradient-to-r from-[var(--c-borde)] to-[var(--c-acento)]" />

        {/* Navegación */}
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.fin}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm transition-colors border ${
                  isActive
                    ? "border-[var(--c-acento)] bg-gradient-to-r from-[var(--c-acento-30)] to-[var(--c-acento-5)] text-[var(--c-texto)] font-bold"
                    : "border-transparent text-[var(--c-texto-sec)] font-medium hover:bg-[var(--c-borde-20)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario, tema y cerrar sesión */}
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 shrink-0 rounded-full border border-[var(--c-acento)] bg-[var(--c-fondo)] flex items-center justify-center text-sm font-bold text-[var(--c-acento)]">
              {inicial}
            </div>
            <p className="flex-1 text-sm text-[var(--c-texto)] truncate">{usuario?.nombre}</p>
            <BotonTema />
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-[var(--c-rojo)] border border-[var(--c-rojo-70)] bg-[var(--c-rojo-10)] hover:bg-[var(--c-rojo-20)] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Borde derecho dorado */}
      <div className="w-[2px] bg-gradient-to-b from-[var(--c-borde)] to-[var(--c-acento)]" />
    </div>
  );
}