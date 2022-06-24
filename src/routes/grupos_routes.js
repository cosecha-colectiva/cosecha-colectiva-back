import { Router } from "express";
import {crear_grupo, agregar_socio } from "../controllers/grupos_control";

const router = Router()

router.post('/crear_grupo', crear_grupo, agregar_socio);
router.post('/agregar_socio', agregar_socio);

export default router