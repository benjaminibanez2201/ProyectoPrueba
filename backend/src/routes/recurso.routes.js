import { Router } from "express";
import { uploadRecurso, getRecursos, deleteRecurso } from "../controllers/recurso.controller.js";
import { uploadRecursoMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

// Ruta para subir (POST /api/recursos)
// Usamos la versión que espera el campo 'file'
router.post("/", uploadRecursoMiddleware, uploadRecurso);

// Ruta para ver la lista (GET /api/recursos)
router.get("/", getRecursos);

// Ruta para borrar (DELETE /api/recursos/:id)
router.delete("/:id", deleteRecurso);

export default router;