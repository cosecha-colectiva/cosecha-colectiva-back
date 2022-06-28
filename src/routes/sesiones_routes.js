const { crear_sesion, registrar_asistencias, enviar_inasistencias_sesion, registrar_retardos } = require('../controllers/sesiones_control');

const router = require('express').Router();

router.post("/crear_sesion", crear_sesion);
router.post("/registrar_asistencias", registrar_asistencias);
router.post("/registrar_retardos", registrar_retardos);
router.get("/obtener_inasistencias_sesion", enviar_inasistencias_sesion);
// router.post("/actualizar_caja", actualizar_caja);
// router.post("/registrar_asistencia", registrar_asistencia);

module.exports = router;