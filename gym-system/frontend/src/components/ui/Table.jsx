import { useIdioma } from "../../context/IdiomaContext.jsx";

// Tabla generica: columnas = [{ key, label, render? }], filas = [...]
export default function Table({ columnas, filas, vacio }) {
  const { tr } = useIdioma();
  const textoVacio = vacio ?? tr.sinResultados;
  return (
    <div className="overflow-x-auto bg-[var(--c-tarjeta)] border border-[var(--c-borde)] rounded-lg">
      <table className="min-w-full text-sm text-[var(--c-texto)]">
        <thead>
          <tr className="border-b border-[var(--c-borde-suave)] text-left text-[var(--c-acento)]">
            {columnas.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-8 text-center text-[var(--c-texto-tenue)]">
                {textoVacio}
              </td>
            </tr>
          )}
          {filas.map((fila, i) => (
            <tr key={fila.id ?? i} className="border-b border-[var(--c-borde-30)] last:border-0 hover:bg-[var(--c-borde-20)]">
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