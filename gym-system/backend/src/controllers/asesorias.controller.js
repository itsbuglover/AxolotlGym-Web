import { supabase, revisar, rpc } from "../data/supabase.js";

// Estas rutas son para clientes/instructores. La app Android hoy llama a Supabase directo,
// pero quedan aqui usando las mismas funciones por si se quieren consumir desde la API.

export async function listarInstructores(req, res) {
  const instructores = revisar(await supabase.from("instructores_lista").select("*").order("nombre"));
  res.json({ ok: true, instructores });
}

export async function solicitarAsesoria(req, res) {
  await rpc("solicitar_asesoria", { p_gmail: req.usuario.gmail, p_instructor_id: Number(req.body.instructorId) });
  res.status(201).json({ ok: true, mensaje: "Solicitud enviada" });
}

export async function misClientes(req, res) {
  const filas = await rpc("mis_clientes_instructor", { p_gmail: req.usuario.gmail });
  const asesorias = filas.map((a) => ({ id: a.r_id, nombre: a.r_nombre, dias: a.r_dias, objetivo: a.r_objetivo }));
  res.json({ ok: true, asesorias });
}

export async function actualizarAsesoria(req, res) {
  const { dias = "", objetivo = "" } = req.body;
  await rpc("guardar_asesoria", {
    p_gmail: req.usuario.gmail,
    p_id: Number(req.params.id),
    p_dias: Array.isArray(dias) ? dias.join(", ") : dias,
    p_objetivo: objetivo,
  });
  res.json({ ok: true, mensaje: "Asesoría actualizada" });
}
