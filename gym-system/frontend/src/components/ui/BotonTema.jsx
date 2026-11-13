import { useTema } from "../../context/TemaContext.jsx";

export default function BotonTema({ className = "" }) {
  const { claro, alternar } = useTema();
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={claro ? "Tema oscuro" : "Tema claro"}
      className={`p-2 rounded-full text-[var(--c-texto)] hover:bg-[var(--c-borde-20)] transition-colors ${className}`}
    >
      {claro ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}