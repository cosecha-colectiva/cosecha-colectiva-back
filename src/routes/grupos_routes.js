import { Router } from "express";
import {crear_grupo } from "../controllers/grupos_control";

const router = Router()

router.post('/crear_grupo', crear_grupo);

export default router