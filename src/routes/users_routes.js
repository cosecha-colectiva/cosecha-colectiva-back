import { Router } from "express";
import { login, register, preguntas_seguridad_socio} from "../controllers/users_control";

const router = Router()

router.post('/login', login);
router.post('/register', register, preguntas_seguridad_socio);
router.post('/preguntas_seguridad_socio', preguntas_seguridad_socio);

export default router