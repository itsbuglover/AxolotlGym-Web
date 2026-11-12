import { rpc } from "../data/supabase.js";

const DIMENSION = 192; // MobileFaceNet, igual que la app

// Identifica el rostro y registra ENTRADA o SALIDA automaticamente (misma funcion que la app).
// resultado: ENTRADA, SALIDA, DENEGADO, REPETIDO, YA_DENTRO, SIN_ENTRADA o NO_RECONOCIDO
export async function accesoPorRostro(req, res) {
  const { embedding } = req.body;
  if (!Array.isArray(embedding) || embedding.length !== DIMENSION || !embedding.every(Number.isFinite)) {
    return res.status(400).json({ ok: false, mensaje: "Vector de rostro no válido" });
  }
  const [m] = await rpc("acceso_por_rostro", { p_embedding: embedding });
  res.json({
    ok: true,
    movimiento: {
      resultado: m.r_resultado,
      clienteId: m.r_cliente_id,
      nombre: m.r_nombre,
      membresia: m.r_membresia,
      activa: m.r_activa,
      esEntrada: m.r_es_entrada,
      fechaHora: m.r_fecha_hora,
      entradaDesde: m.r_entrada_desde,
      dentroTotal: m.r_dentro_total,
      similitud: m.r_similitud,
    },
  });
}

// Personas dentro del gimnasio ahora
export async function ocupacionActual(req, res) {
  res.json({ ok: true, dentro: (await rpc("ocupacion_actual")) ?? 0 });
}

// Foto de perfil del cliente (JPEG en base64) o null
export async function fotoCliente(req, res) {
  const foto = await rpc("foto_cliente_por_id", { p_cliente_id: Number(req.params.id) });
  res.json({ ok: true, foto: foto || null });
}
