import { Router } from "express";
import { gruposRoutes } from "./grupos/gruposRoutes";
import { sociosRoutes } from "./socios/sociosRoutes";

const router = Router();

router.use("/socios", sociosRoutes);
router.use("/grupos", gruposRoutes);

export { router as indexRoutes };