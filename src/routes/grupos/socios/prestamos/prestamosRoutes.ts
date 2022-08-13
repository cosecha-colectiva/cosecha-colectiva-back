import { Router } from "express";
import { pagar_prestamos } from "../../../../controllers/prestamos_control";
import { authAdmin } from "../../../../middleware/auth";

// Router empezando en /api/grupos/socios/:Socio_id/prestamos
const router = Router();

// Pagar prestamos
router.patch("/", authAdmin, pagar_prestamos);

export { router as prestamosRoutes };
