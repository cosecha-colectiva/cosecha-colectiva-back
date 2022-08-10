import { Router } from "express";
import { register, login, unirse_grupo, recuperar_password } from "../../controllers/socios_control";
import { authSocio } from "../../middleware/auth";
import { actualizar_password } from "../../utils/validaciones";

const router = Router();

// Registrar un socio
router.post("/", register);
// Login
router.post("/login", login);
// Unirse a un grupo
router.post("/grupos", authSocio, unirse_grupo);
// Actualizar password
router.patch("/password", authSocio, actualizar_password);
// Recuperar password
router.put("/password", authSocio, recuperar_password);

export { router as sociosRoutes };