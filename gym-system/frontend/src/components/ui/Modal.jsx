export default function Modal({ abierto, titulo, onClose, children }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--c-tarjeta)] border border-[var(--c-borde)] rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--c-borde-suave)]">
          <h3 className="font-semibold text-[var(--c-texto)]">{titulo}</h3>
          <button onClick={onClose} className="text-[var(--c-texto-sec)] hover:text-[var(--c-acento)] text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}