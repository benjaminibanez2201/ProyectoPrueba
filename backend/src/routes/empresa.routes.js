/**
 * ENRUTADOR DE EMPRESA 
 * Define los endpoints para que los supervisores externos gestionen las prácticas
 */
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

/**
 * 1. GENERAR TOKEN
 * POST /api/empresa/generar-token
 * Acción realizada por el coordinador para crear el acceso que se enviará por correo
 */
router.post("/generar-token", generarTokenEmpresa);

/**
 * 2. VER FORMULARIO (Protección por Middleware)
 * GET /api/empresa/ver-formulario
 * Aquí se aplica 'validarTokenEmpresa' para asegurar que el token sea válido antes de mostrar cualquier dato
 */
router.get("/ver-formulario", validarTokenEmpresa, verFormulario);

/**
 * 3. ENVIAR EVALUACIÓN
 * POST /api/empresa/enviar-evaluacion
 * Permite a la empresa calificar al alumno
 */
router.post("/enviar-evaluacion", enviarEvaluacion);

/**
 * 4. VALIDAR ACCESO (Punto de entrada del Frontend)
 * GET /api/empresa/validar-acceso/:token
 * Endpoint que el frontend de la empresa llama apenas carga la página para verificar si el enlace aún es válido o ha expirado
 */
router.get("/validar-acceso/:token", validarToken);

/**
 * 5. CONFIRMAR INICIO DE PRÁCTICA
 * POST /api/empresa/confirmar-inicio-practica
 * La empresa valida que el alumno comenzó sus labores en la fecha acordada
 */
router.post("/confirmar-inicio-practica", confirmarInicioPractica)

/**
 * 6. OBTENER FORMULARIO ESPECÍFICO
 * GET /api/empresa/formulario/:token?tipo=postulacion
 * Permite a la empresa consultar formularios completados
 */
router.get("/formulario/:token", getFormularioByToken);

export default router;
