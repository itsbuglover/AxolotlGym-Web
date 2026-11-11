// ==========================================================================
// "Base de datos" en memoria SOLO para que el scaffold funcione end-to-end.
// Cuando conectes tu base de datos real (MySQL/Postgres/Mongo/Firebase...),
// reemplaza el contenido de estos arrays por tus queries/modelos reales,
// pero manten la MISMA FORMA (shape) de los objetos para no romper el front.
// ==========================================================================

export const usuarios = [
  // rol: "dueno" | "encargado" | "recepcion" | "instructor" | "cliente"
  {
    id: 1,
    nombre: "Ana Torres",
    correo: "duena@gym.com",
    password: "123456", // OJO: en produccion debe ir hasheado con bcrypt
    telefono: "3121234567",
    rol: "dueno",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Luis Ramirez",
    correo: "recepcion@gym.com",
    password: "123456",
    telefono: "3121234568",
    rol: "recepcion",
    estado: "activo",
  },
  {
    id: 3,
    nombre: "Karla Mendez",
    correo: "instructor@gym.com",
    password: "123456",
    telefono: "3121234569",
    rol: "instructor",
    estado: "activo",
    costoServicio: 450,
    capacidadMaxima: 15,
    fotoPerfil: null,
  },
];

export const clientes = [
  {
    id: 1,
    numMembresia: "MEM-0001",
    nombre: "Carlos Perez",
    correo: "carlos@correo.com",
    telefono: "3121112233",
    password: "123456",
    fechaRegistro: "2026-01-15",
    estado: "activo",
  },
  {
    id: 2,
    numMembresia: "MEM-0002",
    nombre: "Sofia Diaz",
    correo: "sofia@correo.com",
    telefono: "3121112234",
    password: "123456",
    fechaRegistro: "2026-02-10",
    estado: "inactivo",
  },
];

export const servicios = [
  { id: 1, nombre: "Membresia mensual", duracion: "1 mes", precio: 400 },
  { id: 2, nombre: "Membresia trimestral", duracion: "3 meses", precio: 1050 },
  { id: 3, nombre: "Pase por dia", duracion: "1 dia", precio: 60 },
];

export const asesorias = [
  // vinculan cliente <-> instructor
  {
    id: 1,
    clienteId: 1,
    instructorId: 3,
    estado: "aprobada", // pendiente | aprobada | rechazada
    dias: ["Lunes", "Miercoles", "Viernes"],
    objetivo: "Perdida de grasa",
    costo: 450,
    fechaSolicitud: "2026-08-01",
  },
];

export const solicitudes = [
  {
    id: 1,
    clienteId: 2,
    clienteNombre: "Sofia Diaz",
    instructorId: 3,
    instructorNombre: "Karla Mendez",
    costo: 450,
    fechaSolicitud: "2026-09-01",
    estado: "pendiente", // pendiente | aprobada | rechazada
    leida: false,
  },
];

export const gastos = [
  {
    id: 1,
    concepto: "Pago de luz",
    categoria: "Servicios",
    monto: 1200,
    fecha: "2026-09-01",
  },
  {
    id: 2,
    concepto: "Mantenimiento de equipo",
    categoria: "Mantenimiento",
    monto: 850,
    fecha: "2026-09-03",
  },
];

// Registro de entradas por QR, usado para la grafica de horas / ocupacion
export const entradas = [
  { id: 1, clienteId: 1, fecha: "2026-09-08", hora: 7 },
  { id: 2, clienteId: 2, fecha: "2026-09-08", hora: 7 },
  { id: 3, clienteId: 1, fecha: "2026-09-08", hora: 18 },
];

// Autoincrement simple para el scaffold
export function siguienteId(arr) {
  return arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}
