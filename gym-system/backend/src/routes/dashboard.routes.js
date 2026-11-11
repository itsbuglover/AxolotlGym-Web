import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  resumenDashboard, ocupacionPorHora, clientesPorMes, entradasPorDia,
} from "../controllers/dashboard.controller.js";

const router = Router();
router.use(verificarToken);
router.get("/resumen", permitirRoles("encargado", "dueno"), resumenDashboard);
router.get("/ocupacion", ocupacionPorHora); // usado por cliente, recepcion, dueño
router.get("/clientes-por-mes", permitirRoles("encargado", "dueno"), clientesPorMes);
router.get("/entradas-por-dia", permitirRoles("encargado", "dueno"), entradasPorDia);
export default router;
