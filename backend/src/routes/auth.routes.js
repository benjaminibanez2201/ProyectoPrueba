import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerValidationSchema } from "../validation/user.validation.js";

const router = Router();

// Aplica el middleware SOLO al registro
router.post("/register", validate(registerValidationSchema), register);

// El login no necesita validación tan compleja todavía
router.post("/login", login);

export default router;

