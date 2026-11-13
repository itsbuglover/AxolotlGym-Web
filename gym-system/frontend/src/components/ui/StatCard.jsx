export default function StatCard({ titulo, valor, acento = "primary" }) {
  const acentos = {
    primary: "border-l-[var(--c-acento)] text-[var(--c-acento-texto)]",
    green: "border-l-[var(--c-verde)] text-[var(--c-verde-texto)]",
    red: "border-l-[var(--c-rojo)] text-[var(--c-rojo-texto)]",
    amber: "border-l-[var(--c-ambar)] text-[var(--c-ambar-texto)]",
  };
  return (
    <div
      className={`bg-[var(--c-tarjeta)] rounded-lg border border-[var(--c-borde)] border-l-4 p-4 ${acentos[acento] || acentos.primary}`}
    >
      <p className="text-sm text-[var(--c-texto-sec)]">{titulo}</p>
      <p className="text-2xl font-semibold mt-1">{valor}</p>
    </div>
  );
}