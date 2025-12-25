import { Router } from "express";
import { FormularioController } from "../controllers/formulario.controller.js";
import { authMiddleware,} from "../middleware/auth.middleware.js";
import { submitBitacora } from "../controllers/formulario.controller.js";
import { getRespuesta } from '../controllers/formulario.controller.js';
import { getTodasLasPlantillas } from "../controllers/formulario.controller.js";
import { corregirPostulacion } from "../controllers/formulario.controller.js";
import { deleteBitacora } from "../controllers/formulario.controller.js";

const router = Router();
const controller = new FormularioController();

// Ruta para obtener la estructura del formulario
router.get("/plantilla/:tipo", controller.getPlantillaByTipo);

router.get("/", controller.getAllPlantillas); // Listar todas
router.put("/:id", controller.updatePlantilla); // Guardar cambios
router.post("/", authMiddleware(["coordinador"]), controller.createPlantilla);
router.delete("/:id", authMiddleware(["coordinador"]), controller.deletePlantilla);
router.post("/bitacora",authMiddleware(["alumno"]), submitBitacora); // Nueva ruta para guardar Bitácora
router.get('/respuesta/:id',authMiddleware(["alumno", "coordinador"]), getRespuesta);//[GET] /api/formularios/respuesta/:id (Obtener una respuesta de formulario por ID)
router.get("/plantillas", getTodasLasPlantillas);
// Alumno corrige su postulación rechazada
router.put('/respuesta/:id/correccion', authMiddleware(["alumno"]), corregirPostulacion);
// Alumno elimina su bitácora
router.delete('/bitacora/:id', authMiddleware(["alumno"]), deleteBitacora);

export default router;
