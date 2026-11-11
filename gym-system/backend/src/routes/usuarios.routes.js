import { Router } from "express";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import {
  listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario,
} from "../controllers/usuarios.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("encargado", "dueno"));
router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
export default router;
