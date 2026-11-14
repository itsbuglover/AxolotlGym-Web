import { useIdioma } from "../../context/IdiomaContext.jsx";

// Fondo del login: auroras + palabras gigantes + piso de cuadros + pesas y rayos flotando.

// Trazo y relleno vienen del CSS, asi que siguen el tema claro/oscuro
const ICONOS = {
  mancuerna: (
    <svg viewBox="0 0 120 60">
      <rect x="30" y="26" width="60" height="8" rx="3" />
      <rect x="18" y="10" width="12" height="40" rx="4" />
      <rect x="5" y="19" width="11" height="22" rx="3" />
      <rect x="90" y="10" width="12" height="40" rx="4" />
      <rect x="104" y="19" width="11" height="22" rx="3" />
    </svg>
  ),
  pesaRusa: (
    <svg viewBox="0 0 100 100">
      <path d="M33 40 C30 8 70 8 67 40" fill="none" />
      <circle cx="50" cy="64" r="30" />
      <circle cx="50" cy="64" r="14" fill="none" strokeWidth="2" />
    </svg>
  ),
  disco: (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" />
      <circle cx="50" cy="50" r="32" fill="none" strokeWidth="2" />
      <circle cx="50" cy="50" r="9" />
      <path d="M50 4 V16 M50 84 V96 M4 50 H16 M84 50 H96" fill="none" strokeWidth="2" />
    </svg>
  ),
  barra: (
    <svg viewBox="0 0 180 60">
      <rect x="4" y="27" width="172" height="6" rx="3" />
      <rect x="30" y="8" width="12" height="44" rx="4" />
      <rect x="46" y="16" width="9" height="28" rx="3" />
      <rect x="138" y="8" width="12" height="44" rx="4" />
      <rect x="125" y="16" width="9" height="28" rx="3" />
    </svg>
  ),
  rayo: (
    <svg viewBox="0 0 100 100">
      <path d="M58 4 L20 56 H46 L38 96 L80 40 H54 Z" />
    </svg>
  ),
};

// Posiciones fijas (sin Math.random) para que no cambien entre renders
const ITEMS = [
  { tipo: "mancuerna", x: "4%",  s: "88px",  d: 26, t: -2,  r0: "-20deg", r1: "25deg",   o: 0.85, y: "20%" },
  { tipo: "rayo",      x: "13%", s: "56px",  d: 24, t: -14, r0: "10deg",  r1: "-10deg",  o: 0.9,  y: "70%" },
  { tipo: "pesaRusa",  x: "23%", s: "70px",  d: 28, t: -8,  r0: "-10deg", r1: "20deg",   o: 0.8,  y: "40%" },
  { tipo: "disco",     x: "32%", s: "80px",  d: 34, t: -20, r0: "0deg",   r1: "180deg",  o: 0.7,  y: "85%" },
  { tipo: "rayo",      x: "40%", s: "64px",  d: 25, t: -5,  r0: "-8deg",  r1: "12deg",   o: 0.9,  y: "10%" },
  { tipo: "barra",     x: "47%", s: "130px", d: 32, t: -18, r0: "5deg",   r1: "-12deg",  o: 0.75, y: "60%" },
  { tipo: "rayo",      x: "58%", s: "50px",  d: 23, t: -11, r0: "-15deg", r1: "15deg",   o: 0.9,  y: "30%" },
  { tipo: "pesaRusa",  x: "67%", s: "84px",  d: 29, t: -3,  r0: "12deg",  r1: "-18deg",  o: 0.8,  y: "78%" },
  { tipo: "disco",     x: "76%", s: "66px",  d: 35, t: -24, r0: "0deg",   r1: "-200deg", o: 0.7,  y: "15%" },
  { tipo: "rayo",      x: "84%", s: "60px",  d: 26, t: -16, r0: "10deg",  r1: "-14deg",  o: 0.9,  y: "50%" },
  { tipo: "mancuerna", x: "92%", s: "92px",  d: 28, t: -9,  r0: "-25deg", r1: "15deg",   o: 0.85, y: "88%" },
  { tipo: "barra",     x: "20%", s: "120px", d: 33, t: -27, r0: "-6deg",  r1: "10deg",   o: 0.7,  y: "25%" },
];

export default function FondoGym() {
  const { tr } = useIdioma();
  const palabras = tr.palabrasFondo;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Luces difusas */}
      <div className="fx-aurora fx-aurora-a" />
      <div className="fx-aurora fx-aurora-b" />
      <div className="fx-aurora fx-aurora-c" />

      {/* Palabras gigantes en contorno */}
      <div className="fx-fila fx-fila-1">
        <span>{palabras.repeat(4)}</span>
        <span>{palabras.repeat(4)}</span>
      </div>
      <div className="fx-fila fx-fila-2">
        <span>{palabras.repeat(4)}</span>
        <span>{palabras.repeat(4)}</span>
      </div>

      {/* Piso de cuadros en perspectiva */}
      <div className="fx-piso-escena">
        <div className="fx-piso" />
      </div>

      {/* Vineta suave para dar foco al centro */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, var(--c-fondo) 120%)" }}
      />

      {/* Pesas y rayos */}
      {ITEMS.map((it, i) => (
        <div
          key={i}
          className={`fx-icono ${it.tipo === "rayo" ? "fx-rayo" : ""}`}
          style={{
            "--x": it.x,
            "--s": it.s,
            "--d": `${it.d}s`,
            "--t": `${it.t}s`,
            "--r0": it.r0,
            "--r1": it.r1,
            "--o": it.o,
            "--y": it.y,
          }}
        >
          {ICONOS[it.tipo]}
        </div>
      ))}
    </div>
  );
}