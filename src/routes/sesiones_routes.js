const { crear_sesion, registrar_asistencias, enviar_inasistencias_sesion, registrar_retardos } = require('../controllers/sesiones_control');
import {auth} from "../../middelware/auth";

const router = require('express').Router();

router.post("/crear_sesion", auth, crear_sesion);
router.post("/registrar_asistencias", auth, registrar_asistencias);
router.post("/registrar_retardos", auth, registrar_retardos);
router.get("/obtener_inasistencias_sesion", auth, enviar_inasistencias_sesion);
// router.post("/actualizar_caja", actualizar_caja);
// router.post("/registrar_asistencia", registrar_asistencia);

module.exports = router;