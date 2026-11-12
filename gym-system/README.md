# Gym System — Scaffold (Recepcion + Encargado/Dueño)

Backend (Node.js/Express) y frontend web (React + Tailwind) para **Recepción** y **Encargado**.
La web usa **la misma base de datos de Supabase que la app Android**: las mismas vistas
(`clientes_lista`, `personal_lista`, `solicitudes_lista`, `reporte_mensual`, ...) y las mismas
funciones (`login_auto`, `crear_cliente`, `renovar_membresia`, `crear_personal`, ...).
Lo que se haga en la web se ve en la app y al revés.

El frontend nunca habla con Supabase directo: la llave vive solo en `backend/.env`.

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
cp .env.example .env   # pon SUPABASE_URL y SUPABASE_KEY (los mismos de local.properties de la app)
npm install
npm run dev            # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

### Acceso
Entra con un usuario real de la base con rol **RECEPCION** o **ENCARGADO** (los mismos de la app).
Clientes e instructores reciben un aviso para usar la app móvil.

- Clientes y personal nuevos se crean con la contraseña temporal `Axolotl2026`
  (al personal se le cambia por la que escriba el Encargado en el formulario).
- Las contraseñas deben tener 8+ caracteres, mayúscula, minúscula, número y símbolo.

### Producción (Vercel)
El frontend en Vercel necesita `VITE_API_URL` apuntando al backend publicado
(por ejemplo en Render o Railway) con sus variables `SUPABASE_URL`, `SUPABASE_KEY` y `JWT_SECRET`.

## Que ya esta cubierto

**Login** (`/login`) — correo y contraseña, redirige segun el rol.

**Recepcion**
- `/recepcion` — **acceso con reconocimiento facial**, igual que la app: el cliente mira a la cámara y se registra
  su entrada o salida automáticamente (`acceso_por_rostro`). Muestra cuántas personas hay dentro.
- `/recepcion/clientes` — tabla con buscador, filtro por estado, boton renovar y formulario para nuevo cliente.
- `/recepcion/solicitudes` — tabla de solicitudes de asesoria con badge de pendientes y botones aprobar/rechazar.

**Encargado / Dueño** (mismo rol de vistas, roles `encargado` y `dueno`)
- `/encargado` — dashboard con tarjetas (clientes activos/inactivos, ingresos del mes), grafica de ocupacion por hora, grafica de clientes activos/inactivos por los 12 meses, y grafica de entradas por dia de la semana.
- `/encargado/usuarios` — tabla de usuarios (nombre, rol, correo, estado, editar/eliminar) + formulario para crear usuario, que despliega campos extra (costo, capacidad maxima) cuando el rol es instructor.
- `/encargado/servicios` — tabla con nombre, duracion, precio + formulario para agregar/editar.
- `/encargado/gastos` — tabla con concepto, categoria, monto, fecha + formulario para agregar/editar.
- `/encargado/reportes` — tabla mensual (periodo, servicio, asesorias, gastos, total).

## Reconocimiento facial en la web

Funciona igual que la app y con los mismos rostros registrados:

- Modelo: el mismo `mobilefacenet.tflite` de la app (en `frontend/public/models/`), corriendo en el
  navegador con TensorFlow.js. Detección de rostro con MediaPipe (`blaze_face_short_range.tflite`).
- Mismo proceso que `CapturaFacial.kt`: rostro más cercano, una sola persona, 3 muestras consistentes,
  recorte a 112×112. Solo viaja el vector de 192 números, nunca la foto.
- La app recorta con ML Kit y la web con MediaPipe; como MobileFaceNet es sensible al recorte, la web
  calcula 3 recortes (`RECORTES` en `frontend/src/facial/reconocedor.js`) y los prueba en orden hasta
  que uno coincide (un `NO_RECONOCIDO` no registra nada). El que funcionó se prueba primero la próxima vez.
  Si un cliente no es reconocido, la consola del navegador muestra la mejor similitud obtenida.
- Necesita HTTPS (o `localhost`) para que el navegador permita usar la cámara.
- Los archivos WebAssembly se copian solos a `public/` antes de `npm run dev` / `npm run build`.

## Pendiente

- Confirmar pagos por transferencia y cancelar membresías/asesorías desde la web
  (ya existen en la base: `confirmar_pago`, `cancelar_membresia`, `cancelar_asesoria`).
- Registrar el rostro de un cliente desde la web (por ahora se registra en la app, en Clientes).

## Endpoints principales

```
POST   /api/auth/login              (staff: recepcion/instructor/encargado/dueno)
POST   /api/auth/login-cliente      (app Android)

GET    /api/clientes
POST   /api/clientes
PUT    /api/clientes/:id
PUT    /api/clientes/:id/renovar
GET    /api/clientes/planes

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

POST   /api/acceso/rostro           (vector de 192 números -> ENTRADA/SALIDA/DENEGADO/NO_RECONOCIDO...)
GET    /api/acceso/ocupacion        (personas dentro)
GET    /api/acceso/foto/:id         (foto del cliente)
```
