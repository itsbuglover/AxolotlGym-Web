export default function Modal({ abierto, titulo, onClose, children }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#3D3D3F] border border-[#93834C] rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#93834C]/60">
          <h3 className="font-semibold text-[#EEEEF3]">{titulo}</h3>
          <button onClick={onClose} className="text-[#E3E3EC] hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}