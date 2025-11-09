import { Router } from "express";
import { getAlumnos } from "../controllers/user.controller.js";
import { checkAuth, isCoordinador } from "../middleware/auth.middleware.js";

const router = Router();

//ruta para obtener el listado de alumnos (solo coordinador de practica)
router.get("/alumnos", [checkAuth, isCoordinador(["coordinador"])], getAlumnos);

export default router;