const { crear_multa, get_multas_por_grupo, pagar_multas } = require('../controllers/multas_control');
import {auth} from "../../middelware/auth";

const router = require('express').Router();

router.get("/multas_por_grupo", auth, get_multas_por_grupo);
router.post("/crear_multa", auth, crear_multa);
router.post("/pagar_multas", auth, pagar_multas);

export default router;