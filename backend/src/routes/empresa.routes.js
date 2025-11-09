import express from "express";
import {
  generarTokenEmpresa,
  verFormulario,
  enviarEvaluacion,
} from "../controllers/empresa.controller.js";
import { validarTokenEmpresa } from "../middleware/empresaAuth.middleware.js";

const router = express.Router();

// Generar token (coordinador crea el token para la empresa)
router.post("/generar-token", generarTokenEmpresa);

// Ver formulario (empresa accede con su token)
router.get("/ver-formulario", validarTokenEmpresa, verFormulario);

// Enviar evaluación (empresa envía datos)
router.post("/enviar-evaluacion", validarTokenEmpresa, enviarEvaluacion);

export default router;
