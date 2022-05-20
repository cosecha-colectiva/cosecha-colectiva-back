import { Router } from "express";
import {crear_grupos } from "../controllers/grupos_control";

const router = Router()

router.post('/crear_grupos', crear_grupos);

export default router