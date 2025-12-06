import { Router } from "express";
import { getAlumnos, 
        verDetallesAlumnos } from "../controllers/user.controller.js";
import { checkAuth, isCoordinador } from "../middleware/auth.middleware.js";

const router = Router();

//ruta para obtener el listado de alumnos (solo coordinador de practica)
router.get("/alumnos", [checkAuth, isCoordinador(["coordinador"])], getAlumnos);

//ruta para que el coordinador consulte la información completa de un alumno específico
router.get("/alumnos/:id/detalles", [checkAuth, isCoordinador(["coordinador"])], verDetallesAlumnos);

export default router;