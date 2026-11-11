import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarGastos, crearGasto, actualizarGasto, eliminarGasto,
} from "../controllers/gastos.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", listarGastos);
router.post("/", crearGasto);
router.put("/:id", actualizarGasto);
router.delete("/:id", eliminarGasto);
export default router;
