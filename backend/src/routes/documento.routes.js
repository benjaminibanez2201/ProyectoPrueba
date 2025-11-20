import { Router } from "express";
import { uploadDocumento } from "../controllers/documento.controller.js";
import {checkAuth} from "../middleware/auth.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

//POST /api/documentos/upload
//1. checkAuth: ver si esta logueado
//2. uploadMiddleware: manejar la subida del archivo
//3. uploadDocumento: guarda info en la bd 
router.post('/upload', [checkAuth, uploadMiddleware], uploadDocumento);
export default router;