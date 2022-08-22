import { Router } from "express";
import { enviar_costo_acciones } from "../../../controllers/acciones_control";

// Router empezando en /api/grupos/:Grupo_id/acciones
const router = Router({ mergeParams: true });

router.get("/costo", enviar_costo_acciones)

export { router as accionesRoutes };