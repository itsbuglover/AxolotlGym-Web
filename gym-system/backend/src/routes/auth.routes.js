import { Router } from "express";
import { loginStaff, loginCliente } from "../controllers/auth.controller.js";

const router = Router();
router.post("/login", loginStaff);         // recepcion, instructor, encargado, dueno
router.post("/login-cliente", loginCliente); // app Android del cliente
export default router;
