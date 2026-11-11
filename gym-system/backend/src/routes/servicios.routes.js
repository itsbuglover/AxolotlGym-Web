import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarServicios, crearServicio, actualizarServicio, eliminarServicio,
} from "../controllers/servicios.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", listarServicios);
router.post("/", crearServicio);
router.put("/:id", actualizarServicio);
router.delete("/:id", eliminarServicio);
export default router;
