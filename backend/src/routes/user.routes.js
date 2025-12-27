/**
 * ENRUTADOR DE USUARIOS (GESTIÓN DE ALUMNOS)
 * Define los endpoints para que el Coordinador supervise a los estudiantes
 */
import { Router } from "express";
import { getAlumnos, 
        verDetallesAlumnos } from "../controllers/user.controller.js";
import { checkAuth, isCoordinador } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * 1. LISTADO GENERAL DE ALUMNOS
 * GET /api/user/alumnos
 * Retorna una lista simplificada de todos los alumnos registrados
 */
router.get("/alumnos", [checkAuth, isCoordinador(["coordinador"])], getAlumnos);

/**
 * 2. VISTA RESUMIDA DE DETALLES
 * GET /api/user/alumnos/detalles
 * Se utiliza para cargar tablas comparativas o dashboards que requieren más información que el listado simple, pero de todos los alumnos a la vez
 */
router.get("/alumnos/detalles", [checkAuth, isCoordinador(["coordinador"])], verDetallesAlumnos);

/**
 * 3. EXPEDIENTE COMPLETO DE UN ALUMNO
 * GET /api/user/alumnos/:id/detalles
 * Recupera toda la "hoja de vida" de la práctica de un estudiante específico
 */
router.get("/alumnos/:id/detalles", [checkAuth, isCoordinador(["coordinador"])], verDetallesAlumnos);

export default router;