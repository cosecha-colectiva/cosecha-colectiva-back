const { agregar_catalogo_transaccion, agregar_catalogo_preguntas_seguridad } = require('../controllers/admin_control');

const router = require('express').Router();

router.post("/agregar_catalogo_transaccion", agregar_catalogo_transaccion);
router.post("/agregar_catalogo_preguntas_seguridad", agregar_catalogo_preguntas_seguridad);

module.exports = router;