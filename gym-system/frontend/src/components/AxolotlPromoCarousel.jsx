
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/img1.png",
    title: "Tu mejor versión empieza aquí",
  },
  {
    image: "/images/img2.png",
    title: "Disciplina que transforma",
  },
  {
    image: "/images/img3.png",
    title: "Disciplina, constancia y resultados",
  },
  {
    image: "/images/img4.png",
    title: "Un espacio para tus objetivos",
  },
  {
    image: "/images/img5.png",
    title: "Somos una comunidad",
  },
  {
    image: "/images/img6.png",
    title: "Entrena hoy por el mañana que quieres",
  },
];

export default function AxolotlPromoCarousel({ onLoginClick }) {
  const [active, setActive] = useState(0);
  const [showAccess, setShowAccess] = useState(false);

  // Carrusel automático
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  // Acceso al sistema
  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setShowAccess(true);
    }
  };

  return (
    <main className="relative h-screen min-h-[500px] w-full overflow-hidden bg-black text-white">

      {/* FONDO Y CARRUSEL */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">

        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className={`absolute left-1/2 top-1/2 h-auto w-full max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 object-contain object-center transition-opacity duration-1000 ${
              index === active
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          />
        ))}

      </div>

      {/* DEGRADADO INFERIOR */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

      {/* CONTROLES INFERIORES */}
      <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between sm:bottom-7 sm:left-10 sm:right-10">

        {/* INDICADORES DEL CARRUSEL */}
        <div className="flex items-center gap-2">

          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={index === active}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === active
                  ? "w-10 bg-[#d2b16c]"
                  : "w-4 bg-white/50 hover:bg-white"
              }`}
            />
          ))}

          <span className="ml-2 text-xs tabular-nums text-white/80">
            {String(active + 1).padStart(2, "0")} / 06
          </span>

        </div>

        {/* ACCESO AL SISTEMA */}
        <button
          type="button"
          onClick={handleLogin}
          className="group flex items-center gap-3 rounded-full border border-[#b8954f]/60 bg-black/75 px-4 py-3 text-white shadow-lg backdrop-blur-md transition hover:border-[#e0c27e] hover:bg-[#b8954f]/20"
        >

          {/* CANDADO */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d2b16c"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          {/* TEXTO */}
          <span className="text-left">
            <span className="block text-xs font-semibold tracking-wide">
              Acceso al sistema
            </span>

            <span className="block text-[10px] text-[#d2b16c]">
              (toca aquí)
            </span>
          </span>

          {/* FLECHA */}
          <span className="text-xl text-[#d2b16c] transition-transform group-hover:translate-x-1">
            ›
          </span>

        </button>
      </div>

      {/* MODAL DE ACCESO */}
      {showAccess && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-5 backdrop-blur-sm"
          onClick={() => setShowAccess(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-title"
        >

          <div
            className="w-full max-w-md rounded-xl border border-[#b8954f]/60 bg-[#1b1b19] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* ENCABEZADO */}
            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-xs tracking-[0.3em] text-[#d2b16c]">
                  AXOLOTL FITNESS CLUB
                </p>

                <h2
                  id="access-title"
                  className="mt-2 text-2xl font-bold"
                >
                  Acceso al sistema
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAccess(false)}
                className="text-2xl text-white/60 hover:text-white"
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>

            {/* BOTÓN DE INICIO DE SESIÓN */}
            <button
              type="button"
              onClick={() => {
                setShowAccess(false);
                onLoginClick?.();
              }}
              className="w-full rounded bg-[#b8954f] px-4 py-3 font-bold text-black transition hover:bg-[#e0c27e]"
            >
              Ir al inicio de sesión
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
