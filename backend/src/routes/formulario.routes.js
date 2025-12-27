/**
 * ENRUTADOR DE FORMULARIOS DINÁMICOS
 * Gestiona la creación de plantillas (admin) y el envío de respuestas (usuarios)
 */
import { Router } from "express";
import { FormularioController } from "../controllers/formulario.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { submitBitacora } from "../controllers/formulario.controller.js";
import { getRespuesta } from "../controllers/formulario.controller.js";
import { getTodasLasPlantillas } from "../controllers/formulario.controller.js";
import { corregirPostulacion } from "../controllers/formulario.controller.js";
import { deleteBitacora } from "../controllers/formulario.controller.js";

const router = Router();
const controller = new FormularioController();

/**
 * GET /api/formularios/plantilla/:tipo
 * Obtiene la estructura de una plantilla específica
 */
router.get("/plantilla/:tipo", controller.getPlantillaByTipo);

/**
 * GET /api/formularios/
 * PUT /api/formularios/:id
 * Lista todas las plantillas y permite editarlas
 */
router.get("/", controller.getAllPlantillas);
router.put("/:id", controller.updatePlantilla);

/**
 * POST /api/formularios/
 * DELETE /api/formularios/:id
 * Crea o elimina plantillas de formulario
 */
router.post("/", authMiddleware(["coordinador"]), controller.createPlantilla);
router.delete(
  "/:id",
  authMiddleware(["coordinador"]),
  controller.deletePlantilla
);

/**
 * POST /api/formularios/bitacora
 * El alumno envía un nuevo reporte de bitácora
 */
router.post("/bitacora", authMiddleware(["alumno"]), submitBitacora);

/**
 * GET /api/formularios/respuesta/:id
 * Obtiene una respuesta específica por su ID
 * El middleware permite el paso, pero el controlador verifica que el alumno solo vea sus propios datos y el coordinador vea todo
 */
router.get(
  "/respuesta/:id",
  authMiddleware(["alumno", "coordinador"]),
  getRespuesta
);

/**
 * GET /api/formularios/plantillas
 * Obtiene el listado de plantillas disponibles en el sistema
 */
router.get("/plantillas", getTodasLasPlantillas);

/**
 * PUT /api/formularios/respuesta/:id/correccion
 * Permite al alumno reenviar su postulación tras recibir observaciones (rechazo)
 */
router.put(
  "/respuesta/:id/correccion",
  authMiddleware(["alumno"]),
  corregirPostulacion
);

/**
 * DELETE /api/formularios/bitacora/:id
 * Permite al alumno eliminar un registro de bitácora erróneo
 */
router.delete("/bitacora/:id", authMiddleware(["alumno"]), deleteBitacora);

export default router;
