import { Router } from "express";
import { asyncH } from "../data/supabase.js";
import { verificarToken, permitirRoles } from "../middleware/auth.js";
import { accesoPorRostro, ocupacionActual, fotoCliente } from "../controllers/acceso.controller.js";

const router = Router();
router.use(verificarToken, permitirRoles("recepcion", "encargado", "dueno"));
router.post("/rostro", asyncH(accesoPorRostro));
router.get("/ocupacion", asyncH(ocupacionActual));
router.get("/foto/:id", asyncH(fotoCliente));
export default router;
