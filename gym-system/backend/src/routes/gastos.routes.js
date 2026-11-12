import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarGastos, crearGasto, actualizarGasto, eliminarGasto,
} from "../controllers/gastos.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", asyncH(listarGastos));
router.post("/", asyncH(crearGasto));
router.put("/:id", asyncH(actualizarGasto));
router.delete("/:id", asyncH(eliminarGasto));
export default router;
