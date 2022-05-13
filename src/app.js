import express from "express";
import userRoutes from './routes/users_routes'

const app = express();
app.use(userRoutes)

export default app