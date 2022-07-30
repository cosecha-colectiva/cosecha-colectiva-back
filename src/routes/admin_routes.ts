import { Router } from 'express';
import { agregar_catalogo_transaccion, agregar_catalogo_preguntas_seguridad } from '../controllers/admin_control';

const router = Router();

router.post("/agregar_catalogo_transaccion", agregar_catalogo_transaccion);
router.post("/agregar_catalogo_preguntas_seguridad", agregar_catalogo_preguntas_seguridad);

export {router as adminRoutes};