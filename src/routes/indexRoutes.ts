import { Router } from "express";
import { enviar_preguntas_seguridad } from "../controllers/socios_control";
import { gruposRoutes } from "./grupos/gruposRoutes";
import { sociosRoutes } from "./socios/sociosRoutes";

const router = Router();

// Recursos
router.use("/socios", sociosRoutes);
router.use("/grupos", gruposRoutes);

// Recursos "debiles"
router.get("/preguntas", enviar_preguntas_seguridad);

// Otras rutas
router.all("/", (req, res) => {
    res.send("Bienvenido a la API de Cosecha Colectiva");
});

export { router as indexRoutes };