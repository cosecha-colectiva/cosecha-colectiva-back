import { Router } from "express";
import { crear_multa, enviar_multas_activas_socio } from "../../../../controllers/multas_control";
import { authAdmin } from "../../../../middleware/auth";

// Router empezando en /api/grupos/:Grupo_id/socios/:Socio_id/multas
const router = Router({ mergeParams: true });

// Crear multa a un socio
router.post("/", authAdmin, crear_multa);
// Obtener multas activas de un socio
router.get("/", authAdmin, enviar_multas_activas_socio);

export { router as multasRoutes };