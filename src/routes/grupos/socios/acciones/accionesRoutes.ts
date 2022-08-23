import { Router } from "express";
import { obtener_acciones_socio, registrar_compra_acciones, registrar_retiro_acciones } from "../../../../controllers/acciones_control";
import { authAdmin } from "../../../../middleware/auth";

// Router empezando en /api/grupos/:Grupo_id/socios/:Socio_id/acciones
const router = Router({ mergeParams: true });

router.post("/", authAdmin, registrar_compra_acciones);
// retirar acciones
router.patch("/", authAdmin, registrar_retiro_acciones);
// obtener acciones de un socio en un grupo
router.get("/", authAdmin, obtener_acciones_socio);

export { router as accionesRoutes };