import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarServicios, crearServicio, actualizarServicio, eliminarServicio,
} from "../controllers/servicios.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", asyncH(listarServicios));
router.post("/", asyncH(crearServicio));
router.put("/:id", asyncH(actualizarServicio));
router.delete("/:id", asyncH(eliminarServicio));
export default router;
