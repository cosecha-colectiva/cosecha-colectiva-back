import { Router } from "express";
import { auth } from "../../middelware/auth";
import { getPrueba, login, register } from "../controllers/users_control";

const router = Router()

router.get('/', auth)
router.post('/login', login)
router.post('/register', register)

export default router