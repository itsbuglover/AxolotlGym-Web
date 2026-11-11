import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarSolicitudes, contarPendientes, aprobarSolicitud, rechazarSolicitud,
} from "../controllers/solicitudes.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("recepcion", "encargado", "dueno"));
router.get("/", listarSolicitudes);
router.get("/pendientes/conteo", contarPendientes);
router.put("/:id/aprobar", aprobarSolicitud);
router.put("/:id/rechazar", rechazarSolicitud);
export default router;
