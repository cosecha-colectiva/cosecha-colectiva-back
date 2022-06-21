const { agregar_catalogo_transaccion } = require('../controllers/transacciones_admin_control');

const router = require('express').Router();

router.post("/agregar_catalogo_transaccion", agregar_catalogo_transaccion);

module.exports = router;