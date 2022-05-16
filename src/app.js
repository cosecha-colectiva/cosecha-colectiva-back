import express from "express";
import userRoutes from './routes/users_routes'
const cors = require('../middelware/cors');
const app = express();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(userRoutes)

export default app