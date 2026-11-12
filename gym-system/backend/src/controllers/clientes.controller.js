import { supabase, revisar, rpc, aWeb } from "../data/supabase.js";

export const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia"];

// Fila de la vista clientes_lista -> forma que usa el frontend.
// "estado" es lo que se ve en la tabla: activo solo si la cuenta esta ACTIVA y la membresia vigente
// (igual que la app). "estadoCuenta" es el estado real del usuario en la base.
function aCliente(c) {
  return {
    id: c.id,
    nombre: c.nombre,
    correo: c.gmail,
    telefono: c.telefono,
    numMembresia: c.numero_membresia,
    codigoQr: c.codigo_qr,
    plan: c.plan,
    fechaRegistro: c.fecha_registro,
    vence: c.fecha_fin,
    estado: c.estado === "ACTIVO" && c.activa ? "activo" : "inactivo",
    estadoCuenta: aWeb(c.estado),
  };
}

async function buscarFila(id) {
  const filas = revisar(await supabase.from("clientes_lista").select("*").eq("id", id));
  return filas[0];
}

export async function listarClientes(req, res) {
  const { buscar, estado } = req.query;
  const filas = revisar(await supabase.from("clientes_lista").select("*").order("nombre"));
  let clientes = filas.map(aCliente);
  if (buscar) {
    const q = buscar.toLowerCase();
    clientes = clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.numMembresia.toLowerCase().includes(q) ||
        (c.codigoQr || "").toLowerCase() === q
    );
  }
  if (estado) clientes = clientes.filter((c) => c.estado === estado);
  res.json({ ok: true, clientes });
}

// Planes (tipos_membresia) para el formulario, igual que la app
export async function listarPlanes(req, res) {
  const planes = revisar(await supabase.from("tipos_membresia").select("nombre, precio").order("precio", { ascending: false }));
  res.json({ ok: true, planes, metodos: METODOS_PAGO });
}

export async function obtenerCliente(req, res) {
  const fila = await buscarFila(req.params.id);
  if (!fila) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  const contacto = await rpc("contacto_emergencia_cliente", {
    p_actor_gmail: req.usuario.gmail,
    p_cliente_id: fila.id,
  });
  res.json({
    ok: true,
    cliente: {
      ...aCliente(fila),
      contactoNombre: contacto?.[0]?.r_nombre || "",
      contactoTelefono: contacto?.[0]?.r_telefono || "",
    },
  });
}

// La base genera numero de membresia, QR y contraseña temporal (Axolotl2026)
export async function crearCliente(req, res) {
  const { nombre, correo, telefono, plan, metodo, contactoNombre, contactoTelefono } = req.body;
  if (!nombre || !correo || !plan) {
    return res.status(400).json({ ok: false, mensaje: "nombre, correo y plan son obligatorios" });
  }
  const filas = await rpc("crear_cliente", {
    p_nombre: nombre,
    p_telefono: telefono || "",
    p_gmail: correo,
    p_plan: plan,
    p_registrado_por: req.usuario.gmail,
    p_contacto_nombre: contactoNombre || "",
    p_contacto_telefono: contactoTelefono || "",
    p_metodo: metodo || "Efectivo",
  });
  const r = filas[0];
  const pendiente = !r.r_vence;
  res.status(201).json({
    ok: true,
    cliente: { id: r.r_id, numMembresia: r.r_numero, codigoQr: r.r_qr, vence: r.r_vence },
    mensaje: pendiente
      ? `Cliente ${r.r_numero} creado. El pago por transferencia queda pendiente de confirmar.`
      : `Cliente ${r.r_numero} creado. Contraseña temporal: Axolotl2026`,
  });
}

export async function actualizarCliente(req, res) {
  const actual = await buscarFila(req.params.id);
  if (!actual) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  const { nombre, correo, telefono, estadoCuenta, contactoNombre, contactoTelefono } = req.body;
  const mandaContacto = contactoNombre != null || contactoTelefono != null;
  await rpc("editar_cliente", {
    p_id: actual.id,
    p_nombre: nombre ?? actual.nombre,
    p_telefono: telefono ?? actual.telefono,
    p_gmail: correo ?? actual.gmail,
    p_estado: estadoCuenta ? estadoCuenta.toUpperCase() : actual.estado,
    // null = conserva el contacto que ya tenia
    p_contacto_nombre: mandaContacto ? contactoNombre || "" : null,
    p_contacto_telefono: mandaContacto ? contactoTelefono || "" : null,
  });
  res.json({ ok: true, cliente: aCliente(await buscarFila(actual.id)) });
}

export async function renovarCliente(req, res) {
  const actual = await buscarFila(req.params.id);
  if (!actual) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  const plan = req.body?.plan || actual.plan;
  if (!plan) return res.status(400).json({ ok: false, mensaje: "Selecciona un plan" });

  const vence = await rpc("renovar_membresia", {
    p_cliente_id: actual.id,
    p_plan: plan,
    p_registrado_por: req.usuario.gmail,
    p_metodo: req.body?.metodo || "Efectivo",
  });
  res.json({
    ok: true,
    vence,
    mensaje: vence ? `Membresía renovada hasta ${vence}` : "Renovación registrada; el pago por transferencia queda pendiente",
  });
}

export function eliminarCliente(req, res) {
  // La base no permite borrar clientes a mano (se eliminan solos tras 1 año sin uso)
  res.status(405).json({ ok: false, mensaje: "Los clientes no se eliminan; márcalos como inactivos" });
}
