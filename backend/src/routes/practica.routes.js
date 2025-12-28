/**
 * ENRUTADOR DE PRÁCTICAS
 * Centraliza todas las operaciones del ciclo de vida de una práctica profesional
 */
import { Router } from "express";
import { PracticaController } from "../controllers/practica.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new PracticaController();

/**
 * GET /practicas
 * Obtener todas las prácticas del sistema
 */
router.get("/", authMiddleware(["coordinador"]), controller.getAll);

/**
 * GET /practicas/me
 * Obtener la práctica específica del alumno que tiene la sesión iniciada
 */
router.get("/me", authMiddleware(["alumno"]), controller.getMyPractica);

/**
 * GET /practicas/:id
 * Obtener los detalles de una práctica por su ID único
 */
router.get(
  "/:id",
  authMiddleware(["coordinador", "alumno", "empresa"]),
  controller.getById
);

/**
 * POST /practicas
 * Crear una práctica manualmente
 */
router.post("/", authMiddleware(["coordinador"]), controller.create);

/**
 * POST /practicas/postular
 * Iniciar una postulación de práctica
 * Crea el registro inicial y dispara el proceso de validación
 */
router.post(
  "/postular",
  authMiddleware(["alumno"]),
  controller.postularPractica
);

/**
 * PUT /practicas/:id
 * Actualizar datos generales de la práctica
 */
router.put(
  "/:id",
  authMiddleware(["coordinador", "empresa"]),
  controller.update
);

/**
 * DELETE /practicas/:id
 * Eliminar una práctica del sistema
 */
router.delete("/:id", authMiddleware(["coordinador"]), controller.delete);

/**
 * PUT /practicas/estado/:id
 * Actualizar el estado de la práctica de forma manual
 */
router.put(
  "/estado/:id",
  authMiddleware(["coordinador"]),
  controller.actualizarEstado
);

/**
 * PATCH /practicas/:id/cerrar
 * Cierre administrativo y definitivo
 * Bloquea la práctica tras haber sido evaluada exitosamente
 */
router.patch(
  "/:id/cerrar",
  authMiddleware(["coordinador"]),
  controller.cerrarPractica
);

/**
 * PATCH /practicas/:id/aprobar
 * Aprobar el inicio de una práctica
 * Cambia el estado a 'en_curso' tras validar los datos iniciales
 */
router.patch(
  "/:id/aprobar",
  authMiddleware(["coordinador"]),
  controller.aprobarInicioPractica
);

/**
 * PATCH /practicas/:id/observar
 * Observar o rechazar temporalmente una práctica
 * Devuelve la solicitud al alumno para que realice correcciones
 */
router.patch(
  "/:id/observar",
  authMiddleware(["coordinador"]),
  controller.observarPractica
);

/**
 * POST /practicas/:id/finalizar
 * Finalizar la práctica para solicitar evaluación
 * Marca la práctica como completada y gatilla el envío de correos a la empresa
 */
router.post(
  "/:id/finalizar",
  authMiddleware(["alumno"]),
  controller.finalizarPractica
);

export default router;
