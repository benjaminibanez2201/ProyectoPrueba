/**
 * ENRUTADOR DE RECURSOS INFORMATIVOS
 * Gestiona la biblioteca de documentos generales y reglamentos del sistema
 */
import { Router } from "express";
import { uploadRecurso, getRecursos, deleteRecurso } from "../controllers/recurso.controller.js";
import { uploadRecursoMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

/**
 * 1. SUBIR NUEVO RECURSO
 * POST /api/recursos
 * uploadRecursoMiddleware procesa el archivo enviado en el campo 'file'
 * uploadRecurso, el controlador guarda la URL y el nombre en la base de datos.
 */
router.post("/", uploadRecursoMiddleware, uploadRecurso);

/**
 * 2. OBTENER LISTADO DE RECURSOS
 * GET /api/recursos
 * Retorna un array con todos los documentos disponibles para que el frontend los muestre en una lista de descargas
 */
router.get("/", getRecursos);

/**
 * 3. ELIMINAR RECURSO
 * DELETE /api/recursos/:id
 * Elimina el registro de la base de datos y el archivo físico del servidor
 */
router.delete("/:id", deleteRecurso);

export default router;