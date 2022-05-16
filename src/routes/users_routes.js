import { Router } from "express";
import { getPrueba, register } from "../controllers/users_control";

const router = Router()

router.get('/', getPrueba)
router.post('/login', getPrueba)
router.post('/register', register)

export default router