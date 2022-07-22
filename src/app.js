import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import { authAdmin } from "./middleware/auth";
import { acuerdosRoutes } from "./routes/acuerdos_routes";
import { userRoutes } from "./routes/users_routes";
import { gruposRoutes } from "./routes/grupos_routes";
import { sesionesRoutes } from "./routes/sesiones_routes";
import notFound from "./middleware/notFound";
import { adminRoutes } from "./routes/admin_routes";
import { multasRoutes } from "./routes/multas_routes";
import { prestamosRoutes } from "./routes/prestamos_routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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