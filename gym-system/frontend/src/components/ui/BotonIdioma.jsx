import { useIdioma } from "../../context/IdiomaContext.jsx";

export default function BotonIdioma({ className = "" }) {
  const { idioma, alternarIdioma, tr } = useIdioma();

  return (
    <button
      type="button"
      onClick={alternarIdioma}
      aria-label={tr.cambiarIdioma}
      title={tr.cambiarIdioma}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--c-borde)] bg-[var(--c-tarjeta)] text-xs font-bold text-[var(--c-texto)] hover:border-[var(--c-acento)] hover:bg-[var(--c-borde-20)] transition-colors ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--c-acento)]"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span>{idioma === "es" ? "ES / EN" : "EN / ES"}</span>
    </button>
  );
}
