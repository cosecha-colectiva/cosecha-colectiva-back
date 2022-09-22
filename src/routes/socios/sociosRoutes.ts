import { Router } from "express";
import { register, login, unirse_grupo, recuperar_password, cambiar_password, cambiar_pregunta_seguridad } from "../../controllers/socios_control";
import { authSocio } from "../../middleware/auth";

const router = Router({ mergeParams: true });

//Informacion de pantalla mis grupos
router.get("/grupos", authSocio, unirse_grupo);
// Registrar un socio
router.post("/", register);
// Login
router.post("/login", login);
// Recuperar password
router.put("/password", recuperar_password);

// Unirse a un grupo
router.post("/grupos", authSocio, unirse_grupo);
// Cambiar password
router.patch("/password", authSocio, cambiar_password);
// Cambiar pregunta de seguridad
router.patch("/pregunta", authSocio, cambiar_pregunta_seguridad);

export { router as sociosRoutes };