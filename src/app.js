import express from "express";
import userRoutes from './routes/users_routes'
const cors = require('cors');
const morgan = require("morgan");
const config = require("../config/config");
const session = require("express-session");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

// Routes
app.use(userRoutes)

export default app