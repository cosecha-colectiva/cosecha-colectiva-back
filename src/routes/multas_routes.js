const { crear_multa, get_multas_por_grupo, pagar_multa } = require('../controllers/multas_control');

const router = require('express').Router();

router.get("/multas_por_grupo", get_multas_por_grupo);
router.post("/crear_multa", crear_multa);
router.post("/pagar_multa", pagar_multa);

module.exports = router;