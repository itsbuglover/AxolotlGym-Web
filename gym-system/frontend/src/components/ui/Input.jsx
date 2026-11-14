import { useState } from "react";

export default function Input({ label, type, ...props }) {
  const [ver, setVer] = useState(false);
  const esPassword = type === "password";

  return (
    <label className="block mb-3">
      {label && <span className="block text-sm font-medium text-[var(--c-texto-sec)] mb-1">{label}</span>}
      <div className="relative">
        <input
          type={esPassword && ver ? "text" : type}
          className={
            "w-full bg-[var(--c-campo)] border border-[var(--c-borde)] text-[var(--c-texto)] placeholder:text-[var(--c-texto-tenue)] " +
            "rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--c-acento)] focus:ring-2 focus:ring-[var(--c-acento-60)] " +
            // Evita que el autocompletado del navegador pinte el campo de azul claro
            "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--c-campo)] " +
            "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--c-texto)] " +
            "[&:-webkit-autofill]:[caret-color:var(--c-texto)]" +
            (esPassword ? " pr-10" : "")
          }
          {...props}
        />

        {/* Ojito para mostrar / ocultar la contraseña */}
        {esPassword && (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--c-texto-sec)] hover:text-[var(--c-acento)] transition-colors"
          >
            {ver ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  );
}