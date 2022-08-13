import { Router } from "express";
import { gruposRoutes } from "./grupos/gruposRoutes";
import { sociosRoutes } from "./socios/sociosRoutes";

const router = Router();

router.use("/socios", sociosRoutes);
router.use("/grupos", gruposRoutes);

router.all("/", (req, res) => {
    res.send("Bienvenido a la API de Cosecha Colectiva");
});

export { router as indexRoutes };