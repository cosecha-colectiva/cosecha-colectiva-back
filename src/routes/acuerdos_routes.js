import { Router } from "express";
import { crear_acuerdos, crear_acuerdo_secundario } from "../controllers/acuerdos_control";
import {auth} from "../../middelware/auth";

const router = Router();

router.post("/crear_acuerdos", auth, crear_acuerdos);
router.post("/crear_acuerdos_secundarios", auth, crear_acuerdo_secundario)

export default router;