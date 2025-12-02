import { Router } from "express";
import { getAlumnos, 
        verDetallesAlumnos, 
        obtenerPracticasConfirmadasPorEmpresa, 
        aprobarPractica, 
        rechazarPractica } from "../controllers/user.controller.js";
import { checkAuth, isCoordinador } from "../middleware/auth.middleware.js";

const router = Router();

// ruta para obtener prácticas confirmadas por empresa
router.get("/practicas/confirmadas-por-empresa", [checkAuth, isCoordinador(["coordinador"])], obtenerPracticasConfirmadasPorEmpresa);

//ruta para obtener el listado de alumnos (solo coordinador de practica)
router.get("/alumnos", [checkAuth, isCoordinador(["coordinador"])], getAlumnos);

//ruta para que el coordinador consulte la información completa de un alumno específico
router.get("/alumnos/:id/detalles", [checkAuth, isCoordinador(["coordinador"])], verDetallesAlumnos);

// ruta para aprobar práctica
router.post("/practicas/:id/aprobar", [checkAuth, isCoordinador(["coordinador"])], aprobarPractica);

// ruta para rechazar práctica
router.post("/practicas/:id/rechazar", [checkAuth, isCoordinador(["coordinador"])], rechazarPractica);

export default router;