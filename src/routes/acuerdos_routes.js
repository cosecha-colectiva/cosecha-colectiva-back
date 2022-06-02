import { Router } from "express";
import { crear_acuerdos, crear_acuerdo_secundario } from "../controllers/acuerdos_control";

const router = Router();

router.post("/crear_acuerdos", crear_acuerdos);
router.post("/crear_acuerdos_secundarios", crear_acuerdo_secundario)

export default router;