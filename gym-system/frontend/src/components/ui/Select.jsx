export default function Select({ label, options, ...props }) {
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm font-medium text-[var(--c-texto-sec)] mb-1">{label}</span>}
      <select
        className="w-full bg-[var(--c-campo)] border border-[var(--c-borde)] text-[var(--c-texto)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--c-acento)] focus:ring-2 focus:ring-[var(--c-acento-60)]"
        {...props}
      >
        {options.map((op) => (
          <option key={op.value} value={op.value} className="bg-[var(--c-campo)] text-[var(--c-texto)]">
            {op.label}
          </option>
        ))}
      </select>
    </label>
  );
}