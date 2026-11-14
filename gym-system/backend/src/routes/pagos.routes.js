import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarPagosPendientes, obtenerComprobante, aceptarPago, rechazarPago,
} from "../controllers/pagos.controller.js";

const router = Router();
router.use(verificarToken);

router.get("/", permitirRoles("recepcion", "encargado", "dueno"), listarPagosPendientes);
// La imagen del comprobante solo la ve el Encargado / Dueño
router.get("/:id/comprobante", permitirRoles("encargado", "dueno"), obtenerComprobante);
router.put("/:id/aceptar", permitirRoles("recepcion", "encargado", "dueno"), aceptarPago);
router.put("/:id/rechazar", permitirRoles("recepcion", "encargado", "dueno"), rechazarPago);

export default router;