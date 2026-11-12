export default function Badge({ estado }) {
  const estilos = {
    activo: "bg-[#2E8B57]/20 text-[#3FB27F]",
    aprobada: "bg-[#2E8B57]/20 text-[#3FB27F]",
    inactivo: "bg-[#D64545]/20 text-[#E8706F]",
    pendiente: "bg-[#AC933D]/20 text-[#D4B24C]",
    rechazada: "bg-[#D64545]/20 text-[#E8706F]",
    cancelada: "bg-white/10 text-[#E3E3EC]/70",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estilos[estado] || "bg-white/10 text-[#E3E3EC]"}`}>
      {estado}
    </span>
  );
}