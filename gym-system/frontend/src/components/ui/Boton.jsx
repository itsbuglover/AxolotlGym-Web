export default function Boton({ children, variante = "primary", className = "", ...props }) {
  const variantes = {
    primary: "bg-[#8E723A] hover:bg-[#AC933D] text-white",
    outline: "border border-[#AC933D] text-[#AC933D] hover:bg-[#AC933D]/10",
    ghost: "text-[#E3E3EC] hover:bg-white/10",
    exito: "bg-[#2E8B57] hover:bg-[#267349] text-white",
    peligro: "bg-[#D64545] hover:bg-[#B93A3A] text-white",
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