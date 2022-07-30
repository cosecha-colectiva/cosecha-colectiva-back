import { crear_multa, get_multas_por_grupo, pagar_multas } from '../controllers/multas_control';
import { auth } from '../middleware/auth';

const router = require('express').Router();

router.get("/multas_por_grupo", auth, get_multas_por_grupo);
router.post("/crear_multa", auth, crear_multa);
router.post("/pagar_multas", auth, pagar_multas);

export {router as multasRoutes};