const { crear_sesion, actualizar_caja, registrar_asistencias, registrar_asistencia } = require('../controllers/sesiones_control');

const router = require('express').Router();

router.post("/crear_sesion", crear_sesion);
router.post("/actualizar_caja", actualizar_caja);
router.post("/registrar_asistencia", registrar_asistencia);
router.post("/registrar_asistencias", registrar_asistencias);

module.exports = router;