import { clientes, entradas, siguienteId } from "../data/db.js";

// Recepcion/Instructor escanea el QR del cliente (viene el numMembresia codificado)
export function registrarEntrada(req, res) {
  const { numMembresia } = req.body;
  const cliente = clientes.find((c) => c.numMembresia === numMembresia);
  if (!cliente) return res.status(404).json({ ok: false, mensaje: "Membresia no encontrada" });
  if (cliente.estado === "inactivo") {
    return res.status(403).json({ ok: false, mensaje: "La membresia esta inactiva" });
  }
  const ahora = new Date();
  const nueva = {
    id: siguienteId(entradas),
    clienteId: cliente.id,
    fecha: ahora.toISOString().slice(0, 10),
    hora: ahora.getHours(),
  };
  entradas.push(nueva);
  res.json({ ok: true, mensaje: `Bienvenido ${cliente.nombre}`, cliente });
}
