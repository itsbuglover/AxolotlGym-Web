import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarInstructores, solicitarAsesoria, misClientes, actualizarAsesoria,
} from "../controllers/asesorias.controller.js";

const router = Router();
router.use(verificarToken);
router.get("/instructores", permitirRoles("cliente"), asyncH(listarInstructores));
router.post("/solicitar", permitirRoles("cliente"), asyncH(solicitarAsesoria));
router.get("/mis-clientes", permitirRoles("instructor"), asyncH(misClientes));
router.put("/:id", permitirRoles("instructor"), asyncH(actualizarAsesoria));
export default router;
