import express from "express";
const cors = require('cors');
const morgan = require("morgan");

import { auth, authAdmin } from "../middelware/auth";
import userRoutes from './routes/users_routes'
import gruposRoutes from './routes/grupos_routes'
import acuerdosRoutes from './routes/acuerdos_routes'
import adminRoutes from './routes/admin_routes'
import multasRoutes from './routes/multas_routes'
import prestamosRoutes from './routes/prestamos_routes'
import helmet from "helmet";
import notFound from "../middelware/notFound";
const sesionesRoutes = require('./routes/sesiones_routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(helmet());

// Rutas
app.use(userRoutes);
app.use(gruposRoutes);
app.use(acuerdosRoutes);
app.use(sesionesRoutes);
app.use(multasRoutes);
app.use(prestamosRoutes);

// Ruta para admin
app.use("/admin/", authAdmin, adminRoutes);

// Not Found
app.use(notFound);


export default app