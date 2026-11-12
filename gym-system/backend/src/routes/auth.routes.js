import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { loginStaff, loginCliente } from "../controllers/auth.controller.js";

const router = Router();
router.post("/login", asyncH(loginStaff));         // recepcion, instructor, encargado, dueno
router.post("/login-cliente", asyncH(loginCliente)); // app Android del cliente
export default router;
