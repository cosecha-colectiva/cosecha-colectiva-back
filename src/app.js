import express from "express";
import userRoutes from './routes/users_routes'
const cors = require('cors');
const morgan = require("morgan");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

// Routes
app.use(userRoutes)

export default app