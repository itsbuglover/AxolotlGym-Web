import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import { listarReportes } from "../controllers/reportes.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", listarReportes);
export default router;
