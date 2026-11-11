import { clientes, siguienteId } from "../data/db.js";

export function listarClientes(req, res) {
  const { buscar, estado } = req.query;
  let resultado = [...clientes];
  if (buscar) {
    const q = buscar.toLowerCase();
    resultado = resultado.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.numMembresia.toLowerCase().includes(q)
    );
  }
  if (estado) {
    resultado = resultado.filter((c) => c.estado === estado);
  }
  res.json({ ok: true, clientes: resultado });
}

export function obtenerCliente(req, res) {
  const cliente = clientes.find((c) => c.id === Number(req.params.id));
  if (!cliente) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  res.json({ ok: true, cliente });
}

export function crearCliente(req, res) {
  const { nombre, correo, telefono, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ ok: false, mensaje: "nombre, correo y password son obligatorios" });
  }
  const nuevo = {
    id: siguienteId(clientes),
    numMembresia: `MEM-${String(siguienteId(clientes)).padStart(4, "0")}`,
    nombre,
    correo,
    telefono: telefono || "",
    password,
    fechaRegistro: new Date().toISOString().slice(0, 10),
    estado: "activo",
  };
  clientes.push(nuevo);
  res.status(201).json({ ok: true, cliente: nuevo });
}

export function actualizarCliente(req, res) {
  const cliente = clientes.find((c) => c.id === Number(req.params.id));
  if (!cliente) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  Object.assign(cliente, req.body);
  res.json({ ok: true, cliente });
}

export function renovarCliente(req, res) {
  const cliente = clientes.find((c) => c.id === Number(req.params.id));
  if (!cliente) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  cliente.estado = "activo";
  cliente.fechaRegistro = new Date().toISOString().slice(0, 10); // ajusta a tu logica real de vencimiento
  res.json({ ok: true, cliente, mensaje: "Membresia renovada" });
}

export function eliminarCliente(req, res) {
  const idx = clientes.findIndex((c) => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, mensaje: "Cliente no encontrado" });
  clientes.splice(idx, 1);
  res.json({ ok: true, mensaje: "Cliente eliminado" });
}
