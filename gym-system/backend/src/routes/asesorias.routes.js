import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarInstructores, solicitarAsesoria, misClientes, actualizarAsesoria,
} from "../controllers/asesorias.controller.js";

const router = Router();
router.use(verificarToken);
router.get("/instructores", permitirRoles("cliente"), listarInstructores);
router.post("/solicitar", permitirRoles("cliente"), solicitarAsesoria);
router.get("/mis-clientes", permitirRoles("instructor"), misClientes);
router.put("/:id", permitirRoles("instructor"), actualizarAsesoria);
export default router;
