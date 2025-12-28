/**
 * ENRUTADOR DE DOCUMENTOS DE PRÁCTICA
 * Gestiona la carga, eliminación y visualización de archivos privados de los alumnos
 */
import { Router } from "express";
import {
  uploadDocumento,
  deleteDocumentoHandler,
  revisarDocumento,
} from "../controllers/documento.controller.js";
import { checkAuth, isCoordinador } from "../middleware/auth.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

/**
 * 1. SUBIR DOCUMENTO
 * POST /api/documentos/upload
 * checkAuth valida que el usuario tenga un token JWT válido
 * uploadMiddleware  valida el tamaño/formato y lo guarda físicamente en la carpeta /uploads
 * uploadDocumento toma los datos que dejó Multer en 'req.file' y crea el registro en la bdd
 */
router.post("/upload", [checkAuth, uploadMiddleware], uploadDocumento);

/**
 * 2. ELIMINAR DOCUMENTO
 * DELETE /api/documentos/:id
 * Elimina el registro de la base de datos y borra el archivo físico del servidor
 */
router.delete("/:id", checkAuth, deleteDocumentoHandler);

/**
 * 3. REVISAR DOCUMENTO
 * GET /api/documentos/revisar/:id
 * Permite la visualización (inline) o descarga de un archivo específico
 */
router.get("/revisar/:id", checkAuth, revisarDocumento);

export default router;
