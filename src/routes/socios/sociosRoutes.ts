import { Router } from "express";
import { register, login, unirse_grupo, recuperar_password, cambiar_password, cambiar_pregunta_seguridad, enviar_info_socio, enviar_grupos_socio } from "../../controllers/socios_control";
import { authSocio } from "../../middleware/auth";

// router empezando en /api/socios/password
const router = Router({ mergeParams: true });

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

// Enviar info del socio actual
router.get("/", authSocio, enviar_info_socio);
// Enviar grupos a los que pertenece el socio actual
router.get("/grupos", authSocio, enviar_grupos_socio);

export { router as sociosRoutes };