import { createContext, useContext, useEffect, useState } from "react";

const IdiomaContext = createContext(null);

const textos = {
  es: {
    // General / Tema / Idioma
    cambiarIdioma: "English",
    etiquetaIdioma: "Idioma: Español",
    temaOscuro: "Tema oscuro",
    temaClaro: "Tema claro",
    sinResultados: "Sin resultados",
    acciones: "Acciones",
    editar: "Editar",
    eliminar: "Eliminar",
    renovar: "Renovar",
    guardarCambios: "Guardar cambios",
    todos: "Todos",

    // Estados y Roles
    estados: {
      activo: "activo",
      inactivo: "inactivo",
      pendiente: "pendiente",
      aprobada: "aprobada",
      rechazada: "rechazada",
      cancelada: "cancelada",
    },
    roles: {
      recepcion: "Recepción",
      encargado: "Encargado",
      dueno: "Dueño",
      instructor: "Instructor",
      cliente: "Cliente",
    },

    // Fondo animado
    palabrasFondo: "SUDOR · DISCIPLINA · FUERZA · CONSTANCIA · RESULTADOS · ",

    // Login
    login: {
      subtitulo: "Acceso para recepción / encargado",
      correo: "Correo",
      password: "Contraseña",
      ingresando: "Ingresando...",
      ingresar: "Ingresar",
      soloStaff: "Este acceso web es solo para recepción y encargado/dueño",
      errorDefault: "No se pudo iniciar sesión",
    },

    // Sidebar
    menu: {
      escanearQr: "Escanear QR",
      clientes: "Clientes",
      solicitudes: "Solicitudes",
      dashboard: "Dashboard",
      personal: "Personal",
      servicios: "Servicios",
      gastos: "Gastos",
      reportes: "Reportes",
      cerrarSesion: "Cerrar sesión",
    },

    // Escanear QR
    qr: {
      titulo: "Escanear código QR",
      escanearCodigo: "Escanear código",
      abriendoCamara: "Abriendo cámara...",
      camaraApagada: "La cámara está apagada",
      encenderCamara: "Encender cámara",
      errorCamara: "No se pudo abrir la cámara. Revisa que el navegador tenga permiso para usarla.",
      reintentar: "Reintentar",
      apagarCamara: "Apagar cámara",
      infoCliente: "Información del cliente",
      instruccionEscaneo: "Escanea un código para ver la información del cliente",
      membresia: "Membresía",
      estado: "Estado",
      registro: "Registro",
      entrada: "Entrada",
      salida: "Salida",
      codigoNoReconocido: "Código no reconocido",
      errorConsulta: "No se pudo consultar al cliente",
      membresiaVencida: "Membresía vencida. Pasa a renovar",
      entradaRegistrada: "Entrada registrada",
      salidaRegistrada: "Salida registrada",
      errorRegistrar: "Error al registrar",
    },

    // Clientes
    clientes: {
      titulo: "Clientes",
      nuevoBtn: "+ Nuevo cliente",
      buscarPlaceholder: "Buscar por nombre o membresía...",
      activo: "Activo",
      inactivo: "Inactivo",
      colNombre: "Nombre",
      colMembresia: "Membresía",
      colPlan: "Plan",
      colFechaRegistro: "Fecha registro",
      colEstado: "Estado",
      modalEditar: "Editar cliente",
      modalNuevo: "Nuevo cliente",
      nombre: "Nombre",
      apellido: "Apellido",
      telefono: "Teléfono",
      correo: "Correo",
      plan: "Plan",
      seleccionaPlan: "Selecciona un plan",
      guardarNuevo: "Guardar cliente",
      errorGuardar: "No se pudo guardar",
      errorRenovar: "No se pudo renovar",
      membresiaRenovada: "Membresía renovada",
    },

    // Solicitudes
    solicitudes: {
      titulo: "Solicitudes",
      colCliente: "Cliente",
      colInstructor: "Instructor",
      colCosto: "Costo",
      colFecha: "Fecha",
      colEstado: "Estado",
      aprobar: "Aprobar",
      rechazar: "Rechazar",
      sinAcciones: "Sin acciones",
    },

    // Dashboard
    dashboard: {
      titulo: "Dashboard",
      clientesActivos: "Clientes activos",
      clientesInactivos: "Clientes inactivos",
      ingresosMes: "Ingresos del mes",
      ocupacionHora: "Ocupación por hora (personas dentro)",
      personas: "Personas",
      clientes12Meses: "Clientes activos / inactivos (12 meses)",
      activos: "Activos",
      inactivos: "Inactivos",
      entradasDia: "Entradas por día de la semana",
      entradas: "Entradas",
      mesesCortos: {
        Ene: "Ene", Feb: "Feb", Mar: "Mar", Abr: "Abr", May: "May", Jun: "Jun",
        Jul: "Jul", Ago: "Ago", Sep: "Sep", Oct: "Oct", Nov: "Nov", Dic: "Dic",
      },
      diasCortos: {
        Lun: "Lun", Mar: "Mar", Mie: "Mié", Jue: "Jue", Vie: "Vie", Sab: "Sáb", Dom: "Dom",
      },
    },

    // Personal
    personal: {
      titulo: "Personal",
      nuevoBtn: "+ Agregar personal",
      colNombre: "Nombre",
      colRol: "Rol",
      colCorreo: "Correo",
      colEstado: "Estado",
      modalEditar: "Editar personal",
      modalNuevo: "Agregar personal",
      nombre: "Nombre",
      telefono: "Teléfono",
      correoLogin: "Correo (con el que inicia sesión)",
      passwordInicial: "Contraseña inicial",
      rol: "Rol",
      estado: "Estado",
      activo: "Activo",
      inactivo: "Inactivo",
      costoServicio: "Costo del servicio",
      capacidadMaxima: "Capacidad máxima de clientes",
      guardarNuevo: "Agregar al personal",
      errorGuardar: "No se pudo guardar",
      errorEliminar: "No se pudo eliminar",
    },

    // Servicios
    servicios: {
      titulo: "Servicios",
      nuevoBtn: "+ Nuevo servicio",
      colNombre: "Nombre",
      colDuracion: "Duración",
      colPrecio: "Precio",
      modalEditar: "Editar servicio",
      modalNuevo: "Nuevo servicio",
      nombre: "Nombre",
      duracion: "Duración",
      duracionPlaceholder: "ej. 1 mes",
      precio: "Precio",
      guardarNuevo: "Guardar servicio",
      errorGuardar: "No se pudo guardar el servicio",
    },

    // Gastos
    gastos: {
      titulo: "Gastos",
      nuevoBtn: "+ Nuevo gasto",
      colConcepto: "Concepto",
      colCategoria: "Categoría",
      colMonto: "Monto",
      colFecha: "Fecha",
      modalEditar: "Editar gasto",
      modalNuevo: "Nuevo gasto",
      concepto: "Concepto",
      categoria: "Categoría",
      monto: "Monto",
      fecha: "Fecha",
      guardarNuevo: "Guardar gasto",
      errorGuardar: "No se pudo guardar el gasto",
    },

    // Reportes
    reportes: {
      titulo: "Reportes mensuales",
      colPeriodo: "Periodo",
      colServicio: "Servicio",
      colAsesorias: "Asesorías",
      colGastos: "Gastos",
      colTotal: "Total",
      meses: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ],
    },

    // Validaciones
    val: {
      esObligatorio: (campo) => `${campo} es obligatorio`,
      minLetras: (campo) => `${campo}: mínimo 3 letras`,
      soloLetras: (campo) => `${campo}: solo letras`,
      minCaracteres: (campo) => `${campo}: mínimo 3 caracteres`,
      soloLetrasNumeros: (campo) => `${campo}: solo letras y números`,
      telefono10: "El teléfono debe tener 10 dígitos",
      correoObligatorio: "El correo es obligatorio",
      correoInvalido: "Correo no válido",
      seleccionaPlan: "Selecciona un plan",
      passwordObligatoria: "La contraseña es obligatoria",
      passwordMin8: "Mínimo 8 caracteres",
      numeroMayorCero: (campo) => `${campo} debe ser un número mayor a 0`,
      enteroMayorCero: (campo) => `${campo} debe ser un entero mayor a 0`,
      fechaObligatoria: "La fecha es obligatoria",
      fechaFutura: "La fecha no puede ser futura",
    },
  },

  en: {
    // General / Theme / Language
    cambiarIdioma: "Español",
    etiquetaIdioma: "Language: English",
    temaOscuro: "Dark theme",
    temaClaro: "Light theme",
    sinResultados: "No results",
    acciones: "Actions",
    editar: "Edit",
    eliminar: "Delete",
    renovar: "Renew",
    guardarCambios: "Save changes",
    todos: "All",

    // Statuses and Roles
    estados: {
      activo: "active",
      inactivo: "inactive",
      pendiente: "pending",
      aprobada: "approved",
      rechazada: "rejected",
      cancelada: "cancelled",
    },
    roles: {
      recepcion: "Reception",
      encargado: "Manager",
      dueno: "Owner",
      instructor: "Instructor",
      cliente: "Client",
    },

    // Animated background
    palabrasFondo: "SWEAT · DISCIPLINE · STRENGTH · CONSISTENCY · RESULTS · ",

    // Login
    login: {
      subtitulo: "Reception / Manager access",
      correo: "Email",
      password: "Password",
      ingresando: "Signing in...",
      ingresar: "Sign in",
      soloStaff: "This web access is only for reception and manager/owner",
      errorDefault: "Could not sign in",
    },

    // Sidebar
    menu: {
      escanearQr: "Scan QR",
      clientes: "Clients",
      solicitudes: "Requests",
      dashboard: "Dashboard",
      personal: "Staff",
      servicios: "Services",
      gastos: "Expenses",
      reportes: "Reports",
      cerrarSesion: "Sign out",
    },

    // Scan QR
    qr: {
      titulo: "Scan QR code",
      escanearCodigo: "Scan code",
      abriendoCamara: "Opening camera...",
      camaraApagada: "Camera is off",
      encenderCamara: "Turn on camera",
      errorCamara: "Could not open camera. Check browser permissions.",
      reintentar: "Retry",
      apagarCamara: "Turn off camera",
      infoCliente: "Client information",
      instruccionEscaneo: "Scan a code to view client information",
      membresia: "Membership",
      estado: "Status",
      registro: "Registered",
      entrada: "Check-in",
      salida: "Check-out",
      codigoNoReconocido: "Unrecognized code",
      errorConsulta: "Could not fetch client",
      membresiaVencida: "Expired membership. Please renew",
      entradaRegistrada: "Check-in registered",
      salidaRegistrada: "Check-out registered",
      errorRegistrar: "Error registering",
    },

    // Clients
    clientes: {
      titulo: "Clients",
      nuevoBtn: "+ New client",
      buscarPlaceholder: "Search by name or membership...",
      activo: "Active",
      inactivo: "Inactive",
      colNombre: "Name",
      colMembresia: "Membership",
      colPlan: "Plan",
      colFechaRegistro: "Registration date",
      colEstado: "Status",
      modalEditar: "Edit client",
      modalNuevo: "New client",
      nombre: "First name",
      apellido: "Last name",
      telefono: "Phone",
      correo: "Email",
      plan: "Plan",
      seleccionaPlan: "Select a plan",
      guardarNuevo: "Save client",
      errorGuardar: "Could not save",
      errorRenovar: "Could not renew",
      membresiaRenovada: "Membership renewed",
    },

    // Requests
    solicitudes: {
      titulo: "Requests",
      colCliente: "Client",
      colInstructor: "Instructor",
      colCosto: "Cost",
      colFecha: "Date",
      colEstado: "Status",
      aprobar: "Approve",
      rechazar: "Reject",
      sinAcciones: "No actions",
    },

    // Dashboard
    dashboard: {
      titulo: "Dashboard",
      clientesActivos: "Active clients",
      clientesInactivos: "Inactive clients",
      ingresosMes: "Monthly revenue",
      ocupacionHora: "Hourly occupancy (people inside)",
      personas: "People",
      clientes12Meses: "Active / inactive clients (12 months)",
      activos: "Active",
      inactivos: "Inactive",
      entradasDia: "Check-ins by day of the week",
      entradas: "Check-ins",
      mesesCortos: {
        Ene: "Jan", Feb: "Feb", Mar: "Mar", Abr: "Apr", May: "May", Jun: "Jun",
        Jul: "Jul", Ago: "Aug", Sep: "Sep", Oct: "Oct", Nov: "Nov", Dic: "Dec",
      },
      diasCortos: {
        Lun: "Mon", Mar: "Tue", Mie: "Wed", Jue: "Thu", Vie: "Fri", Sab: "Sat", Dom: "Sun",
      },
    },

    // Staff
    personal: {
      titulo: "Staff",
      nuevoBtn: "+ Add staff",
      colNombre: "Name",
      colRol: "Role",
      colCorreo: "Email",
      colEstado: "Status",
      modalEditar: "Edit staff",
      modalNuevo: "Add staff",
      nombre: "Name",
      telefono: "Phone",
      correoLogin: "Email (used to sign in)",
      passwordInicial: "Initial password",
      rol: "Role",
      estado: "Status",
      activo: "Active",
      inactivo: "Inactive",
      costoServicio: "Service cost",
      capacidadMaxima: "Max client capacity",
      guardarNuevo: "Add staff",
      errorGuardar: "Could not save",
      errorEliminar: "Could not delete",
    },

    // Services
    servicios: {
      titulo: "Services",
      nuevoBtn: "+ New service",
      colNombre: "Name",
      colDuracion: "Duration",
      colPrecio: "Price",
      modalEditar: "Edit service",
      modalNuevo: "New service",
      nombre: "Name",
      duracion: "Duration",
      duracionPlaceholder: "e.g. 1 month",
      precio: "Price",
      guardarNuevo: "Save service",
      errorGuardar: "Could not save service",
    },

    // Expenses
    gastos: {
      titulo: "Expenses",
      nuevoBtn: "+ New expense",
      colConcepto: "Concept",
      colCategoria: "Category",
      colMonto: "Amount",
      colFecha: "Date",
      modalEditar: "Edit expense",
      modalNuevo: "New expense",
      concepto: "Concept",
      categoria: "Category",
      monto: "Amount",
      fecha: "Date",
      guardarNuevo: "Save expense",
      errorGuardar: "Could not save expense",
    },

    // Reports
    reportes: {
      titulo: "Monthly reports",
      colPeriodo: "Period",
      colServicio: "Services",
      colAsesorias: "Coaching",
      colGastos: "Expenses",
      colTotal: "Total",
      meses: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
    },

    // Validations
    val: {
      esObligatorio: (campo) => `${campo} is required`,
      minLetras: (campo) => `${campo}: minimum 3 letters`,
      soloLetras: (campo) => `${campo}: letters only`,
      minCaracteres: (campo) => `${campo}: minimum 3 characters`,
      soloLetrasNumeros: (campo) => `${campo}: letters and numbers only`,
      telefono10: "Phone must be 10 digits",
      correoObligatorio: "Email is required",
      correoInvalido: "Invalid email",
      seleccionaPlan: "Select a plan",
      passwordObligatoria: "Password is required",
      passwordMin8: "Minimum 8 characters",
      numeroMayorCero: (campo) => `${campo} must be a number greater than 0`,
      enteroMayorCero: (campo) => `${campo} must be an integer greater than 0`,
      fechaObligatoria: "Date is required",
      fechaFutura: "Date cannot be in the future",
    },
  },
};

// Traduce avisos y errores que llegan en español desde el backend / Supabase
function traducirMensajeServidor(msg, idioma) {
  if (!msg || idioma !== "en") return msg;
  const texto = String(msg);

  const exactos = {
    "Correo o contraseña incorrectos": "Incorrect email or password",
    "Los clientes ingresan desde la app Axolotl": "Clients sign in from the Axolotl app",
    "Membresia o contraseña incorrectos": "Incorrect membership or password",
    "Cliente registrado. Contraseña temporal: Axolotl2026": "Client registered. Temporary password: Axolotl2026",
    "Membresia renovada": "Membership renewed",
    "Cliente desactivado": "Client deactivated",
    "Se agrego al personal": "Staff member added",
    "Se agrego al personal. Contraseña temporal: Axolotl2026": "Staff member added. Temporary password: Axolotl2026",
    "Se elimino del personal": "Staff member removed",
    "Solicitud aprobada": "Request approved",
    "Solicitud rechazada": "Request rejected",
    "Membresia vencida. Pasa a renovar": "Expired membership. Please renew",
    "Movimiento repetido, espera unos segundos": "Repeated action, please wait a few seconds",
    "Membresia no encontrada": "Membership not found",
    "Codigo no valido": "Invalid code",
  };
  if (exactos[texto]) return exactos[texto];

  // Mensajes dinamicos de QR / bloqueo
  let m = /^Bienvenido (.+)$/i.exec(texto);
  if (m) return `Welcome ${m[1]}`;

  m = /^Hasta pronto (.+)$/i.exec(texto);
  if (m) return `See you soon ${m[1]}`;

  m = /^(.+) ya tiene una entrada registrada$/i.exec(texto);
  if (m) return `${m[1]} already has a check-in registered`;

  m = /^(.+) no tiene una entrada registrada hoy$/i.exec(texto);
  if (m) return `${m[1]} has no check-in registered today`;

  m = /^Cuenta bloqueada temporalmente\. Intenta de nuevo en (\d+) min$/i.exec(texto);
  if (m) return `Account temporarily locked. Try again in ${m[1]} min`;

  return texto;
}

export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(() => {
    const guardado = localStorage.getItem("idioma");
    return guardado === "en" ? "en" : "es";
  });

  useEffect(() => {
    document.documentElement.lang = idioma;
    localStorage.setItem("idioma", idioma);
  }, [idioma]);

  const alternarIdioma = () => setIdioma((actual) => (actual === "es" ? "en" : "es"));
  const tr = textos[idioma] || textos.es;
  const traducirMsg = (msg) => traducirMensajeServidor(msg, idioma);

  return (
    <IdiomaContext.Provider value={{ idioma, esIngles: idioma === "en", alternarIdioma, tr, traducirMsg }}>
      {children}
    </IdiomaContext.Provider>
  );
}

export const useIdioma = () => useContext(IdiomaContext);
