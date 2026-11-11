import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import { registrarEntrada } from "../controllers/qr.controller.js";

const router = Router();
router.post("/registrar", verificarToken, permitirRoles("recepcion", "instructor", "encargado", "dueno"), registrarEntrada);
export default router;
