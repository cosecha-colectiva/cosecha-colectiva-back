import { Router } from "express";
import { registrar_compra_acciones } from "../../../controllers/acciones_control";
import { crear_multa } from "../../../controllers/multas_control";
import { crear_prestamo } from "../../../controllers/prestamos_control";
import { authAdmin } from "../../../middleware/auth";
import { accionesRoutes } from "./acciones/accionesRoutes";
import { multasRoutes } from "./multas/multasRoutes";
import { prestamosRoutes } from "./prestamos/prestamosRoutes";

// Router empezando en /api/grupos/socios
const router = Router({ mergeParams: true });

// Rutas
// TODO: ruta para enviar una lista de socios 

// Recursos anidados
router.use("/:Socio_id/prestamos", prestamosRoutes);
router.use("/:Socio_id/multas", multasRoutes);
router.use("/:Socio_id/acciones", accionesRoutes);

// Sub-Recursos "debiles"
// Comprar acciones
// TODO: Ruta para enviar "saldo total en prestamos"
// TODO: Ruta para enviar el "Limite de credito"
// TODO: ruta para enviar el numero de prestamos activos de un socio
// TODO: ruta para enviar el total de ganancias acumuladas de un socio


export { router as sociosRoutes }