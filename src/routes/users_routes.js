import { Router } from "express";
import { login, register, preguntas_seguridad_socio, recuperar_password} from "../controllers/users_control";

const router = Router()

router.post('/login', login);
router.post('/register', register, preguntas_seguridad_socio);
router.post('/preguntas_seguridad_socio', preguntas_seguridad_socio);
router.post("/recuperar_password", recuperar_password);

export default router