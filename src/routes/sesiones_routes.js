import { Router } from "express";
import { crear_sesion, registrar_asistencias, registrar_retardos, enviar_inasistencias_sesion } from "../controllers/sesiones_control";
import { auth } from "../middleware/auth";

const router = Router()
router.post("/crear_sesion", auth, crear_sesion);
router.post("/registrar_asistencias", auth, registrar_asistencias);
router.post("/registrar_retardos", auth, registrar_retardos);
router.get("/obtener_inasistencias_sesion", auth, enviar_inasistencias_sesion);

export {router as sesionesRoutes}