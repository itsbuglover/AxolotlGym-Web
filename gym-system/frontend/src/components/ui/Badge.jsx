import { useIdioma } from "../../context/IdiomaContext.jsx";

export default function Badge({ estado }) {
  const { tr } = useIdioma();
  const estilos = {
    activo: "bg-[var(--c-verde-bg)] text-[var(--c-verde-texto)]",
    aprobada: "bg-[var(--c-verde-bg)] text-[var(--c-verde-texto)]",
    inactivo: "bg-[var(--c-rojo-bg)] text-[var(--c-rojo-texto)]",
    pendiente: "bg-[var(--c-acento-15)] text-[var(--c-acento-texto)]",
    rechazada: "bg-[var(--c-rojo-bg)] text-[var(--c-rojo-texto)]",
    cancelada: "bg-[var(--c-rojo-bg)] text-[var(--c-rojo-texto)]",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        estilos[estado] || "bg-[var(--c-borde-20)] text-[var(--c-texto-sec)]"
      }`}
    >
      {tr.estados[estado] || estado}
    </span>
  );
}