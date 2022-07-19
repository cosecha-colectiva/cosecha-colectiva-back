import { Router } from "express";
import { login, register, preguntas_seguridad_socio, recuperar_password} from "../controllers/users_control";
import {auth} from "../../middelware/auth";

const router = Router()

router.post('/login', login);
router.post('/register', register, preguntas_seguridad_socio);
router.post("/recuperar_password", recuperar_password);
router.post('/actualizar_pregunta_seguridad', auth, preguntas_seguridad_socio); // Para restablecer la pregunta de seguridad

export default router