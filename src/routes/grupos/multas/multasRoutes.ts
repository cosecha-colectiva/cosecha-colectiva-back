import { Router } from "express";
import { pagar_multas } from "../../../controllers/multas_control";
import { authAdmin } from "../../../middleware/auth";

// Router empezando en /api/grupos/:Grupo_id/multas
const router = Router({ mergeParams: true });

// Pagar multas
router.patch("/", authAdmin, pagar_multas);

export { router as multasRoutes };