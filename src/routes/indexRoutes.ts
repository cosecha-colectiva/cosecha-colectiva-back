import { Router } from "express";
import { route } from "./admin_routes";
import { gruposRoutes } from "./grupos/gruposRoutes";
import { sociosRoutes } from "./socios/sociosRoutes";

const router = Router();

router.use("/socios", sociosRoutes);
router.use("/grupos", gruposRoutes);

router.all("/", (req, res) => {
    res.send(process.env)
});

export { router as indexRoutes };