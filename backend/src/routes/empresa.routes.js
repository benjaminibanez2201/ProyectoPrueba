import express from "express";
import {
  validarToken,
  confirmarInicioPractica,
  generarTokenEmpresa,
  verFormulario,
  enviarEvaluacion,
  getFormularioByToken,
} from "../controllers/empresa.controller.js";
import { validarTokenEmpresa } from "../middleware/empresaAuth.middleware.js";

const router = express.Router();

// Generar token (coordinador crea el token para la empresa)
router.post("/generar-token", generarTokenEmpresa);

// Ver formulario (empresa accede con su token)
router.get("/ver-formulario", validarTokenEmpresa, verFormulario);

// Enviar evaluación (empresa envía datos)
// La evaluación final se envía con token en el body (sin middleware legado)
router.post("/enviar-evaluacion", enviarEvaluacion);

// Validar token (empresa verifica su token)
// GET api/empresa/validar-acceso/:token
router.get("/validar-acceso/:token", validarToken);
// POST api/empresa/confirmar-inicio-practica
router.post("/confirmar-inicio-practica", confirmarInicioPractica)

// Obtener formulario de la práctica por token (postulación, evaluación)
// GET api/empresa/formulario/:token?tipo=postulacion
router.get("/formulario/:token", getFormularioByToken);

export default router;
