import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarClientes, obtenerCliente, crearCliente,
  actualizarCliente, renovarCliente, eliminarCliente,
} from "../controllers/clientes.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("recepcion", "encargado", "dueno"));
router.get("/", listarClientes);
router.get("/:id", obtenerCliente);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.put("/:id/renovar", renovarCliente);
router.delete("/:id", eliminarCliente);
export default router;
