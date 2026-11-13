export default function Input({ label, ...props }) {
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm font-medium text-[var(--c-texto-sec)] mb-1">{label}</span>}
      <input
        className={
          "w-full bg-[var(--c-campo)] border border-[var(--c-borde)] text-[var(--c-texto)] placeholder:text-[var(--c-texto-tenue)] " +
          "rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--c-acento)] focus:ring-2 focus:ring-[var(--c-acento-60)] " +
          // Evita que el autocompletado del navegador pinte el campo de azul claro
          "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--c-campo)] " +
          "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--c-texto)] " +
          "[&:-webkit-autofill]:[caret-color:var(--c-texto)]"
        }
        {...props}
      />
    </label>
  );
}