import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarClientes, listarPlanes, obtenerCliente, crearCliente,
  actualizarCliente, renovarCliente, eliminarCliente,
} from "../controllers/clientes.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("recepcion", "encargado", "dueno"));
router.get("/", asyncH(listarClientes));
router.get("/planes", asyncH(listarPlanes));
router.get("/:id", asyncH(obtenerCliente));
router.post("/", asyncH(crearCliente));
router.put("/:id", asyncH(actualizarCliente));
router.put("/:id/renovar", asyncH(renovarCliente));
router.delete("/:id", asyncH(eliminarCliente));
export default router;
