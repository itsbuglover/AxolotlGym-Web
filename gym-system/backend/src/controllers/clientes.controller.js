import { supabase, rpc, consulta, manejar, errorHttp, aMinusculas } from "../data/supabase.js";

// Convierte una fila de la vista clientes_lista a la forma que usa el frontend.
// El nombre completo se separa en nombre (primera palabra) y apellido (resto)
// porque el formulario de la web los pide por separado.
function aCliente(f) {
  const partes = (f.nombre || "").trim().split(/\s+/);
  const vigente = f.activa && f.estado === "ACTIVO";
  return {
    id: f.id,
    nombre: partes[0] || "",
    apellido: partes.slice(1).join(" "),
    nombreCompleto: f.nombre,
    correo: f.gmail,
    telefono: f.telefono,
    numMembresia: f.numero_membresia,
    codigoQr: f.codigo_qr,
    plan: aMinusculas(f.plan) || "",
    vence: f.fecha_fin,
    fechaRegistro: f.fecha_registro,
    estadoCuenta: aMinusculas(f.estado),
    estado: vigente ? "activo" : "inactivo",
  };
}

async function buscarPorId(id) {
  const filas = await consulta(supabase.from("clientes_lista").select("*").eq("id", Number(id)).limit(1));
  if (!filas?.length) throw errorHttp(404, "Cliente no encontrado");
  return filas[0];
}

// Los planes en la base se llaman como en tipos_membresia (ej. "Mensual").
// El frontend manda "mensual", asi que se busca sin importar mayusculas.
async function nombrePlan(plan) {
  if (!plan) return null;
  const tipos = await consulta(supabase.from("tipos_membresia").select("nombre"));
  const tipo = tipos.find((t) => t.nombre.toLowerCase() === String(plan).toLowerCase());
  if (!tipo) throw errorHttp(400, `Plan no valido: ${plan}`);
  return tipo.nombre;
}

// Planes disponibles (tipos_membresia) para el formulario de la web
export const listarPlanes = manejar(async (req, res) => {
  const planes = await consulta(supabase.from("tipos_membresia").select("id, nombre, precio, duracion_dias").order("precio"));
  res.json({ ok: true, planes: planes.map((p) => ({ ...p, precio: Number(p.precio) })) });
});

const nombreCompleto = (b) => `${(b.nombre || "").trim()} ${(b.apellido || "").trim()}`.trim();

export const listarClientes = manejar(async (req, res) => {
  const { buscar, estado } = req.query;
  const filas = await consulta(supabase.from("clientes_lista").select("*").order("nombre"));
  let resultado = filas.map(aCliente);
  if (buscar) {
    const q = String(buscar).toLowerCase();
    resultado = resultado.filter(
      (c) =>
        c.nombreCompleto.toLowerCase().includes(q) ||
        String(c.numMembresia).toLowerCase().includes(q) ||
        String(c.codigoQr || "").toLowerCase() === q
    );
  }
  if (estado) resultado = resultado.filter((c) => c.estado === estado);
  res.json({ ok: true, clientes: resultado });
});

export const obtenerCliente = manejar(async (req, res) => {
  res.json({ ok: true, cliente: aCliente(await buscarPorId(req.params.id)) });
});

// Crea usuario + cliente + membresia (con su pago) usando crear_cliente.
// La contraseña inicial la pone la base: Axolotl2026 (el cliente la cambia en la app).
export const crearCliente = manejar(async (req, res) => {
  const { correo, telefono, plan, metodo } = req.body;
  const nombre = nombreCompleto(req.body);
  if (!nombre || !correo) {
    return res.status(400).json({ ok: false, mensaje: "nombre y correo son obligatorios" });
  }
  const filas = await rpc("crear_cliente", {
    p_nombre: nombre,
    p_telefono: telefono || "",
    p_gmail: correo,
    p_plan: await nombrePlan(plan),
    p_registrado_por: req.usuario.correo,
    p_metodo: metodo || "Efectivo",
  });
  const cliente = aCliente(await buscarPorId(filas[0].r_id));
  res.status(201).json({ ok: true, cliente, mensaje: "Cliente registrado. Contraseña temporal: Axolotl2026" });
});

export const actualizarCliente = manejar(async (req, res) => {
  const actual = await buscarPorId(req.params.id);
  const { correo, telefono, estadoCuenta } = req.body;
  await rpc("editar_cliente", {
    p_id: actual.id,
    p_nombre: nombreCompleto(req.body) || actual.nombre,
    p_telefono: telefono ?? actual.telefono,
    p_gmail: correo || actual.gmail,
    p_estado: estadoCuenta ? String(estadoCuenta).toUpperCase() : actual.estado,
  });
  res.json({ ok: true, cliente: aCliente(await buscarPorId(actual.id)) });
});

// Renueva con el plan que mande el frontend o, si no manda, con el ultimo que tuvo
export const renovarCliente = manejar(async (req, res) => {
  const actual = await buscarPorId(req.params.id);
  const plan = await nombrePlan(req.body?.plan || actual.plan);
  if (!plan) {
    return res.status(400).json({ ok: false, mensaje: "El cliente no tiene plan previo; indica uno" });
  }
  await rpc("renovar_membresia", {
    p_cliente_id: actual.id,
    p_plan: plan,
    p_registrado_por: req.usuario.correo,
    p_metodo: req.body?.metodo || "Efectivo",
  });
  res.json({ ok: true, cliente: aCliente(await buscarPorId(actual.id)), mensaje: "Membresia renovada" });
});

// La base no permite borrar clientes (tienen pagos y accesos ligados).
// Se desactivan; la base elimina sola a los inactivos con eliminar_clientes_inactivos.
export const eliminarCliente = manejar(async (req, res) => {
  const actual = await buscarPorId(req.params.id);
  await rpc("editar_cliente", {
    p_id: actual.id,
    p_nombre: actual.nombre,
    p_telefono: actual.telefono,
    p_gmail: actual.gmail,
    p_estado: "INACTIVO",
  });
  res.json({ ok: true, mensaje: "Cliente desactivado" });
});
