const { enviar_socios_prestamo } = require('../controllers/prestamos_control');
import {auth} from "../../middelware/auth";

const router = require('express').Router();

router.post("/enviar_socios_prestamo", auth, enviar_socios_prestamo);
export default router;