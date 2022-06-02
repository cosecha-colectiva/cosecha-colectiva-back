const { crear_sesion, actualizar_caja } = require('../controllers/sesiones_control');

const router = require('express').Router();

router.post("/crear_sesion", crear_sesion);
router.post("/actualizar_caja", actualizar_caja);

module.exports = router;