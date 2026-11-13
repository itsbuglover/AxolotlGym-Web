// Rutas del PERSONAL (recepcion, instructores, encargados). Solo el encargado las usa.
import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarPersonal, crearPersonal, actualizarPersonal, eliminarPersonal,
} from "../controllers/personal.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", listarPersonal);
router.post("/", crearPersonal);
router.put("/:id", actualizarPersonal);
router.delete("/:id", eliminarPersonal);
export default router;
