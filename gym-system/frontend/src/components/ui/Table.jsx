// Tabla generica: columnas = [{ key, label, render? }], filas = [...]
export default function Table({ columnas, filas, vacio = "Sin resultados" }) {
  return (
    <div className="overflow-x-auto bg-[#3D3D3F] border border-[#93834C] rounded-lg">
      <table className="min-w-full text-sm text-[#EEEEF3]">
        <thead>
          <tr className="border-b border-[#93834C]/60 text-left text-[#AC933D]">
            {columnas.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-8 text-center text-[#E3E3EC]/60">
                {vacio}
              </td>
            </tr>
          )}
          {filas.map((fila, i) => (
            <tr key={fila.id ?? i} className="border-b border-[#93834C]/30 last:border-0 hover:bg-white/5">
              {columnas.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(fila) : fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}