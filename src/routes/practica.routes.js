import { Router } from "express";
import { PracticaController } from "../controllers/practica.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; // asegúrate que la ruta es correcta

const router = Router();
const controller = new PracticaController();

// Coordinador: puede ver todas las prácticas
router.get("/", authMiddleware(["coordinador"]), controller.getAll);

// Coordinador, alumno o empresa pueden ver una práctica específica (si corresponde)
router.get("/:id", authMiddleware(["coordinador", "alumno", "empresa"]), controller.getById);

// Coordinador: crea una práctica
router.post("/", authMiddleware(["coordinador"]), controller.create);

// Coordinador o empresa pueden actualizar una práctica (estado, datos, etc.)
router.put("/:id", authMiddleware(["coordinador", "empresa"]), controller.update);

// Coordinador: eliminar práctica
router.delete("/:id", authMiddleware(["coordinador"]), controller.delete);

// Coordinador o empresa: actualizar estado (por ejemplo: en curso, finalizada)
router.patch("/:id/estado", authMiddleware(["coordinador", "empresa"]), controller.actualizarEstado);

// Coordinador: cerrar práctica definitivamente
router.patch("/:id/cerrar", authMiddleware(["coordinador"]), controller.cerrarPractica);

export default router;
