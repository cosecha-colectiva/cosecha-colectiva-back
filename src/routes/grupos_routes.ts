import { Router } from "express";
import {crear_grupo, agregar_socio } from "../controllers/grupos_control";
import { auth } from "../middleware/auth";

const router = Router()

router.post('/crear_grupo', auth, crear_grupo, agregar_socio);
router.post('/agregar_socio', auth, agregar_socio);

export {router as gruposRoutes};