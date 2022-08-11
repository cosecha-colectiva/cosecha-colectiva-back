import { Router } from "express";
import { crear_multa } from "../../../controllers/multas_control";
import { crear_prestamo } from "../../../controllers/prestamos_control";
import { authAdmin } from "../../../middleware/auth";

// Router empezando en /api/grupos/socios
const router = Router();

// Crear multa a un socio
router.post("/:idSocio/multas", authAdmin, crear_multa);
// Crear prestamo a un socio
router.post("/:idSocio/prestamos", authAdmin, crear_prestamo);

export { router as sociosRoutes }