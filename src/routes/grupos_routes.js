import { Router } from "express";
import {crear_grupo, agregar_socio } from "../controllers/grupos_control";
import {auth} from "../../middelware/auth";

const router = Router()

router.post('/crear_grupo', auth, crear_grupo, agregar_socio);
router.post('/agregar_socio', auth, agregar_socio);

export default router;