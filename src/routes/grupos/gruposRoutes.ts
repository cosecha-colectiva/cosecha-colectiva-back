import { Router } from "express";
import { crear_grupo } from "../../controllers/grupos_control";
import { authSocio } from "../../middleware/auth";
import { sociosRoutes } from "./socios/sociosRoutes";
import { acuerdosRoutes } from "./acuerdos/acuerdosRoutes";
import { multasRoutes } from "./multas/multasRoutes";
import { sesionesRoutes } from "./sesiones/sesionesRoutes";
import { prestamosRoutes } from "./prestamos/prestamosRoutes";

const router = Router();

// Crear un grupo
router.post("/", authSocio, crear_grupo);

// Sub-Recursos
router.use("/acuerdos", acuerdosRoutes);
router.use("/multas", multasRoutes);
router.use("/sesiones", sesionesRoutes);
router.use("/socios", sociosRoutes);
router.use("/prestamos", prestamosRoutes);

export { router as gruposRoutes };