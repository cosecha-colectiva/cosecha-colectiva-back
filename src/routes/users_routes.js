import { Router } from "express";
import { getPrueba } from "../controllers/users_control";

const router = Router()

router.get('/', getPrueba)
router.post('/login', getPrueba)
router.post('/register')

export default router