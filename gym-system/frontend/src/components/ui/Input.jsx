export default function Input({ label, ...props }) {
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm font-medium text-[#E3E3EC] mb-1">{label}</span>}
      <input
        className={
          "w-full bg-[#111111] border border-[#93834C] text-[#EEEEF3] placeholder:text-[#E3E3EC]/50 " +
          "rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#AC933D] focus:ring-2 focus:ring-[#AC933D]/60 " +
          // Evita que el autocompletado del navegador pinte el campo de azul claro
          "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#111111] " +
          "[&:-webkit-autofill]:[-webkit-text-fill-color:#EEEEF3] " +
          "[&:-webkit-autofill]:[caret-color:#EEEEF3]"
        }
        {...props}
      />
    </label>
  );
}
