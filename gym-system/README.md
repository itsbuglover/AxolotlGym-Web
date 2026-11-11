# Gym System — Scaffold (Recepcion + Encargado/Dueño)

Este es un **framework base** con backend (Node.js/Express) y frontend web (React + Tailwind)
que cubre las vistas de **Recepcion** y **Encargado/Dueño** que describiste. Los datos vienen de
un arreglo en memoria (`backend/src/data/db.js`) para que todo funcione desde el primer momento;
tu conectas tu base de datos real después y le das el diseño final.

Las vistas de **Clientes** e **Instructores** las harás en Android Studio / Kotlin y consumirán
la misma API (ya deje las rutas `login-cliente`, `asesorias`, etc. listas para eso).

## Estructura

```
gym-system/
  backend/     -> API REST (Express)
  frontend/    -> Web (React + Vite + Tailwind), solo Recepcion y Encargado/Dueño
```

## Como correrlo

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

### Usuarios de prueba (ya vienen en db.js)
| Rol       | Correo             | Contraseña |
|-----------|---------------------|-----------|
| Dueño     | duena@gym.com       | 123456    |
| Recepcion | recepcion@gym.com   | 123456    |

## Que ya esta cubierto

**Login** (`/login`) — correo y contraseña, redirige segun el rol.

**Recepcion**
- `/recepcion` — vista principal para escanear QR + grafica de ocupacion por hora (el lector de QR es un placeholder, ahí conectas tu libreria, ej. `html5-qrcode`).
- `/recepcion/clientes` — tabla con buscador, filtro por estado, boton renovar y formulario para nuevo cliente.
- `/recepcion/solicitudes` — tabla de solicitudes de asesoria con badge de pendientes y botones aprobar/rechazar.

**Encargado / Dueño** (mismo rol de vistas, roles `encargado` y `dueno`)
- `/encargado` — dashboard con tarjetas (clientes activos/inactivos, ingresos del mes), grafica de ocupacion por hora, grafica de clientes activos/inactivos por los 12 meses, y grafica de entradas por dia de la semana.
- `/encargado/usuarios` — tabla de usuarios (nombre, rol, correo, estado, editar/eliminar) + formulario para crear usuario, que despliega campos extra (costo, capacidad maxima) cuando el rol es instructor.
- `/encargado/servicios` — tabla con nombre, duracion, precio + formulario para agregar/editar.
- `/encargado/gastos` — tabla con concepto, categoria, monto, fecha + formulario para agregar/editar.
- `/encargado/reportes` — tabla mensual (periodo, servicio, asesorias, gastos, total).

## Lo que falta que tú conectes/ajustes

- **Base de datos real**: sustituye `backend/src/data/db.js` por tus modelos/queries (MySQL, Postgres, Mongo, Firebase...). Mantén la misma forma de los objetos para no romper el frontend.
- **Hash de contraseñas**: ya esta `bcryptjs` en las dependencias, falta usarlo al crear/verificar usuarios (ahorita las contraseñas estan en texto plano solo para que el scaffold funcione rapido).
- **Lector de QR real** en `EscanearQR.jsx` (recepcion) y en el home del cliente (Android).
- **Foto de perfil de instructores** (subida de imagenes) — falta el manejo de archivos (ej. `multer` + storage).
- **Renovación real de membresías** (ahorita solo marca `activo` y reinicia la fecha, sin logica de vencimiento/pago).
- **Edición** de clientes/usuarios/servicios/gastos: los botones "Editar" están de placeholder, solo falta reutilizar el mismo `Modal` + `PUT` que ya usa "Nuevo".
- Diseño final (colores, tipografia, layout) — el archivo `tailwind.config.js` tiene una paleta simple lista para que la reemplaces.

## Endpoints principales

```
POST   /api/auth/login              (staff: recepcion/instructor/encargado/dueno)
POST   /api/auth/login-cliente      (app Android)

GET    /api/clientes
POST   /api/clientes
PUT    /api/clientes/:id
PUT    /api/clientes/:id/renovar
DELETE /api/clientes/:id

GET    /api/solicitudes
PUT    /api/solicitudes/:id/aprobar
PUT    /api/solicitudes/:id/rechazar

GET    /api/usuarios
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id

GET    /api/servicios | POST | PUT/:id | DELETE/:id
GET    /api/gastos    | POST | PUT/:id | DELETE/:id
GET    /api/reportes

GET    /api/dashboard/resumen
GET    /api/dashboard/ocupacion
GET    /api/dashboard/clientes-por-mes
GET    /api/dashboard/entradas-por-dia

GET    /api/asesorias/instructores      (cliente)
POST   /api/asesorias/solicitar         (cliente)
GET    /api/asesorias/mis-clientes      (instructor)
PUT    /api/asesorias/:id               (instructor)

POST   /api/qr/registrar                (recepcion/instructor)
```
