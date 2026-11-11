export default function StatCard({ titulo, valor, acento = "primary" }) {
  const acentos = {
    primary: "border-l-[#AC933D] text-[#D4B24C]",
    green: "border-l-[#2E8B57] text-[#3FB27F]",
    red: "border-l-[#D64545] text-[#E8706F]",
    amber: "border-l-[#D98E32] text-[#E8A64F]",
  };
  return (
    <div
      className={`bg-[#3D3D3F] rounded-lg border border-[#93834C] border-l-4 p-4 ${acentos[acento] || acentos.primary}`}
    >
      <p className="text-sm text-[#E3E3EC]">{titulo}</p>
      <p className="text-2xl font-semibold mt-1">{valor}</p>
    </div>
  );
}