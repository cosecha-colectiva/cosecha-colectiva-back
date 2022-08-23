import { Router } from "express";
import { crear_prestamo, enviar_prestamos_activos } from "../../../../controllers/prestamos_control";
import { authAdmin } from "../../../../middleware/auth";

// Router empezando en /api/grupos/:Grupo_id/socios/:Socio_id/prestamos
const router = Router({ mergeParams: true });

// Crear prestamo a un socio
router.post("/", authAdmin, crear_prestamo);
// Enviar prestamos activos de un socio
router.get("/", authAdmin, enviar_prestamos_activos);

export { router as prestamosRoutes };
