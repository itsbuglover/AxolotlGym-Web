import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.routes.js";
import clientesRoutes from "./src/routes/clientes.routes.js";
import solicitudesRoutes from "./src/routes/solicitudes.routes.js";
import personalRoutes from "./src/routes/personal.routes.js";
import serviciosRoutes from "./src/routes/servicios.routes.js";
import gastosRoutes from "./src/routes/gastos.routes.js";
import reportesRoutes from "./src/routes/reportes.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import asesoriasRoutes from "./src/routes/asesorias.routes.js";
import qrRoutes from "./src/routes/qr.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/personal", personalRoutes); // recepcion, instructores, encargados (no clientes)
app.use("/api/servicios", serviciosRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/asesorias", asesoriasRoutes);
app.use("/api/qr", qrRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API Gym System activa" });
});

// Manejador de errores simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, mensaje: err.message || "Error interno" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
