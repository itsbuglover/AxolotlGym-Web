import { supabase, consulta, manejar, numero } from "../data/supabase.js";

// Instructores activos con su costo y cupo (vista instructores_lista)
export const listarInstructores = manejar(async (req, res) => {
  const filas = await consulta(supabase.from("instructores_lista").select("*").order("nombre"));
  const instructores = filas.map((i) => ({
    id: i.id,
    nombre: i.nombre,
    correo: i.gmail,
    costoServicio: numero(i.costo),
    capacidadMaxima: numero(i.max_clientes),
    activos: numero(i.activos),
  }));
  res.json({ ok: true, instructores });
});

// Solicitar asesorias y gestionar clientes del instructor se hace desde la app
// Android (usa sus propias funciones de Supabase). La web no tiene esas pantallas.
const soloApp = (req, res) =>
  res.status(501).json({ ok: false, mensaje: "Disponible solo en la app Axolotl" });

export const solicitarAsesoria = soloApp;
export const misClientes = soloApp;
export const actualizarAsesoria = soloApp;
