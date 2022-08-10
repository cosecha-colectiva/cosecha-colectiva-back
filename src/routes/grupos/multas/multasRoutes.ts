import { Router } from "express";
import { pagar_multas } from "../../../controllers/multas_control";
import { authAdmin } from "../../../middleware/auth";

// Router empezando en /api/grupos/multas
const router = Router();

// Pagar multas
router.patch("/", authAdmin, pagar_multas);

export { router as multasRoutes };