import { Router } from "express";
import { enviarMensaje, getHistorial } from "../controllers/comunicacion.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js"; 

const router = Router();

// Ruta para enviar mensaje (Abierta para empresa con token o coordinador con auth)
router.post("/enviar", enviarMensaje);

// Ruta para ver el historial (Protegida para el coordinador)
router.get("/historial/:id", getHistorial);

export default router;