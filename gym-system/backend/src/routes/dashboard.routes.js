import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  resumenDashboard, ocupacionPorHora, clientesPorMes, entradasPorDia,
} from "../controllers/dashboard.controller.js";

const router = Router();
router.use(verificarToken);
router.get("/resumen", permitirRoles("encargado", "dueno"), asyncH(resumenDashboard));
router.get("/ocupacion", asyncH(ocupacionPorHora)); // usado por cliente, recepcion, dueño
router.get("/clientes-por-mes", permitirRoles("encargado", "dueno"), asyncH(clientesPorMes));
router.get("/entradas-por-dia", permitirRoles("encargado", "dueno"), asyncH(entradasPorDia));
export default router;
