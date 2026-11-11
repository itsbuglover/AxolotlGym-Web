import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const menuPorRol = {
  recepcion: [
    { to: "/recepcion", label: "Escanear QR", fin: true },
    { to: "/recepcion/clientes", label: "Clientes" },
    { to: "/recepcion/solicitudes", label: "Solicitudes" },
  ],
  encargado: [
    { to: "/encargado", label: "Dashboard", fin: true },
    { to: "/encargado/clientes", label: "Clientes" },
    { to: "/encargado/usuarios", label: "Usuarios" },
    { to: "/encargado/servicios", label: "Servicios" },
    { to: "/encargado/gastos", label: "Gastos" },
    { to: "/encargado/reportes", label: "Reportes" },
  ],
  dueno: [
    { to: "/encargado", label: "Dashboard", fin: true },
    { to: "/encargado/clientes", label: "Clientes" },
    { to: "/encargado/usuarios", label: "Usuarios" },
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
      <aside className="w-64 bg-[#111111] flex flex-col">
        {/* Encabezado: logo, nombre y rol */}
        <div className="px-5 pt-6 pb-5 flex flex-col items-center">
          <img src="/logo_final.png" alt="Axolotl" className="w-28 h-28 object-contain" />
          <p className="mt-3 text-lg font-bold tracking-[0.3em] text-[#EEEEF3]">AXOLOTL</p>
          <span className="mt-2 px-3.5 py-1 rounded-full border border-[#AC933D] bg-[#AC933D]/15 text-xs font-bold text-[#AC933D]">
            {etiquetaRol[usuario?.rol] || usuario?.rol}
          </span>
        </div>

        <div className="mx-5 h-[1.5px] bg-gradient-to-r from-[#93834C] to-[#AC933D]" />

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
                    ? "border-[#AC933D] bg-gradient-to-r from-[#AC933D]/30 to-[#AC933D]/5 text-[#EEEEF3] font-bold"
                    : "border-transparent text-[#E3E3EC] font-medium hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario y cerrar sesión */}
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 shrink-0 rounded-full border border-[#AC933D] bg-[#222223] flex items-center justify-center text-sm font-bold text-[#AC933D]">
              {inicial}
            </div>
            <p className="text-sm text-[#EEEEF3] truncate">{usuario?.nombre}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-[#D64545] border border-[#D64545]/70 bg-[#D64545]/10 hover:bg-[#D64545]/20 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Borde derecho dorado */}
      <div className="w-[2px] bg-gradient-to-b from-[#93834C] to-[#AC933D]" />
    </div>
  );
}