import { Router } from "express";
import { uploadDocumento,deleteDocumentoHandler } from "../controllers/documento.controller.js";
import {checkAuth} from "../middleware/auth.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

//POST /api/documentos/upload
//1. checkAuth: ver si esta logueado
//2. uploadMiddleware: manejar la subida del archivo
//3. uploadDocumento: guarda info en la bd 
router.post('/upload', [checkAuth, uploadMiddleware], uploadDocumento);

// DELETE /api/documentos/:id
// Borra un documento por su ID
router.delete("/:id", checkAuth, deleteDocumentoHandler);

export default router;