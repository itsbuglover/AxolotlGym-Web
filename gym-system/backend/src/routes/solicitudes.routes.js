import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarSolicitudes, contarPendientes, aprobarSolicitud, rechazarSolicitud,
} from "../controllers/solicitudes.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("recepcion", "encargado", "dueno"));
router.get("/", asyncH(listarSolicitudes));
router.get("/pendientes/conteo", asyncH(contarPendientes));
router.put("/:id/aprobar", asyncH(aprobarSolicitud));
router.put("/:id/rechazar", asyncH(rechazarSolicitud));
export default router;
