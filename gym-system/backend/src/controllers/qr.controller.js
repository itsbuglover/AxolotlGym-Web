import { supabase, rpc, consulta, manejar } from "../data/supabase.js";

// Respuestas de _registrar_movimiento (la misma logica que usa el acceso facial de la app)
const RESPUESTAS = {
  ENTRADA: (n) => [200, `Bienvenido ${n}`],
  SALIDA: (n) => [200, `Hasta pronto ${n}`],
  YA_DENTRO: (n) => [409, `${n} ya tiene una entrada registrada`],
  SIN_ENTRADA: (n) => [409, `${n} no tiene una entrada registrada hoy`],
  DENEGADO: () => [403, "Membresia vencida. Pasa a renovar"],
  REPETIDO: () => [409, "Movimiento repetido, espera unos segundos"],
  NO_RECONOCIDO: () => [404, "Membresia no encontrada"],
};

// Recepcion escanea el QR (numero de membresia o codigo QR del cliente)
export const registrarEntrada = manejar(async (req, res) => {
  const { numMembresia, tipo } = req.body;
  const codigo = String(numMembresia || "").trim();
  // Solo letras, numeros, guion y guion bajo (evita romper el filtro de Supabase)
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(codigo)) {
    return res.status(400).json({ ok: false, mensaje: "Codigo no valido" });
  }
  const filas = await consulta(
    supabase.from("clientes_lista").select("id, nombre").or(`numero_membresia.eq.${codigo},codigo_qr.eq.${codigo}`).limit(1)
  );
  if (!filas.length) return res.status(404).json({ ok: false, mensaje: "Membresia no encontrada" });

  const [r] = await rpc("registrar_movimiento_manual", {
    p_cliente_id: filas[0].id,
    p_es_entrada: tipo !== "salida",
  });
  const respuesta = RESPUESTAS[r?.r_resultado] || (() => [500, "Resultado desconocido"]);
  const [status, mensaje] = respuesta(r?.r_nombre || filas[0].nombre);
  res.status(status).json({ ok: status === 200, mensaje, dentro: r?.r_dentro_total });
});
