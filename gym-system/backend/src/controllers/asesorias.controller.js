import { usuarios, solicitudes, asesorias, siguienteId } from "../data/db.js";

// Lista de instructores para la pantalla de asesorias del cliente
export function listarInstructores(req, res) {
  const instructores = usuarios
    .filter((u) => u.rol === "instructor" && u.estado === "activo")
    .map(({ password, ...resto }) => resto);
  res.json({ ok: true, instructores });
}

// Cliente solicita asesoria con un instructor -> crea una solicitud pendiente
export function solicitarAsesoria(req, res) {
  const { instructorId } = req.body;
  const clienteId = req.usuario?.id; // viene del token del cliente
  const instructor = usuarios.find((u) => u.id === Number(instructorId));
  if (!instructor) return res.status(404).json({ ok: false, mensaje: "Instructor no encontrado" });

  const nueva = {
    id: siguienteId(solicitudes),
    clienteId,
    clienteNombre: req.usuario?.nombre || "Cliente",
    instructorId: instructor.id,
    instructorNombre: instructor.nombre,
    costo: instructor.costoServicio,
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    estado: "pendiente",
    leida: false,
  };
  solicitudes.push(nueva);
  res.status(201).json({ ok: true, solicitud: nueva });
}

// Instructor: solo sus clientes con asesoria activa
export function misClientes(req, res) {
  const instructorId = req.usuario?.id;
  const propias = asesorias.filter((a) => a.instructorId === instructorId && a.estado === "aprobada");
  res.json({ ok: true, asesorias: propias });
}

export function actualizarAsesoria(req, res) {
  const asesoria = asesorias.find((a) => a.id === Number(req.params.id));
  if (!asesoria) return res.status(404).json({ ok: false, mensaje: "Asesoria no encontrada" });
  Object.assign(asesoria, req.body);
  res.json({ ok: true, asesoria });
}
