export default function Select({ label, options, ...props }) {
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm font-medium text-slate-600 mb-1">{label}</span>}
      <select
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        {...props}
      >
        {options.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
    </label>
  );
}
