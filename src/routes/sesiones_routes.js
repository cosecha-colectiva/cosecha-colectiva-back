const { crear_sesion, registrar_asistencias } = require('../controllers/sesiones_control');

const router = require('express').Router();

router.post("/crear_sesion", crear_sesion);
router.post("/registrar_asistencias", registrar_asistencias);
// router.post("/actualizar_caja", actualizar_caja);
// router.post("/registrar_asistencia", registrar_asistencia);

module.exports = router;