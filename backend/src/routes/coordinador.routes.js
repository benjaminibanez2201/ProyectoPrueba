import { Router } from "express";
import { getPendientes, evaluarSolicitud } from "../controllers/coordinador.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // Ajusta la ruta de tu middleware

const router = Router();

// Ruta para ver la tabla de pendientes
router.get("/pendientes", authMiddleware(["coordinador"]), getPendientes);

// Ruta para aprobar/rechazar (PUT porque actualizamos estado)
router.put("/evaluar/:id", authMiddleware(["coordinador"]), evaluarSolicitud);

export default router;