import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario,
} from "../controllers/usuarios.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", asyncH(listarUsuarios));
router.post("/", asyncH(crearUsuario));
router.put("/:id", asyncH(actualizarUsuario));
router.delete("/:id", asyncH(eliminarUsuario));
export default router;
