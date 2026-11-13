export default function Boton({ children, variante = "primary", className = "", ...props }) {
  const variantes = {
    primary: "bg-[var(--c-bronce)] hover:bg-[var(--c-acento)] text-[var(--c-sobre-acento)]",
    outline: "border border-[var(--c-acento)] text-[var(--c-acento)] hover:bg-[var(--c-acento-10)]",
    ghost: "text-[var(--c-texto-sec)] hover:bg-[var(--c-borde-20)]",
    exito: "bg-[var(--c-verde)] hover:brightness-90 text-white",
    peligro: "bg-[var(--c-rojo)] hover:brightness-90 text-white",
  };
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${variantes[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}