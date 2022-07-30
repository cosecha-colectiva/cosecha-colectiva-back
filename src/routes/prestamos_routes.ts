import { enviar_socios_prestamo } from '../controllers/prestamos_control';
import { auth } from '../middleware/auth';


const router = require('express').Router();

router.post("/enviar_socios_prestamo", auth, enviar_socios_prestamo);


export {router as prestamosRoutes}