/**
 * ENRUTADOR DE GESTIÓN (COORDINADOR)
 * Define los endpoints para la revisión y aprobación de nuevas solicitudes de práctica
 */
import { Router } from "express";
import { getPendientes, evaluarSolicitud } from "../controllers/coordinador.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; // Ajusta la ruta de tu middleware

const router = Router();

/**
 * 1. LISTADO DE SOLICITUDES PENDIENTES
 * GET /api/coordinador/pendientes
 * Filtra y muestra todos los procesos que requieren atención inmediata del coordinador
 * authMiddleware verifica que el usuario esté logueado y tenga el rol "coordinador"
 */
router.get("/pendientes", authMiddleware(["coordinador"]), getPendientes);

/**
 * 2. EVALUAR SOLICITUD (Aprobar o Rechazar)
 * PUT /api/coordinador/evaluar/:id
 * Se usa el método PUT porque estamos realizando una actualización completa del estado del recurso (la solicitud de práctica)
 * Restringido únicamente a coordinador
 */
router.put("/evaluar/:id", authMiddleware(["coordinador"]), evaluarSolicitud);

export default router;