import express from "express";
import {
  validarTokenEmpresa,
  confirmarInicioPractica,
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

// Validar token (empresa verifica su token)
router.get("/validar-token", validarTokenEmpresa);
router.post("/confirmar-inicio-practica", confirmarInicioPractica)

export default router;
