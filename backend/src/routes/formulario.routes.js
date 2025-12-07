import { Router } from "express";
import { FormularioController } from "../controllers/formulario.controller.js";
import { authMiddleware,} from "../middleware/auth.middleware.js";
import { submitBitacora } from "../controllers/formulario.controller.js";
import { getRespuesta } from '../controllers/formulario.controller.js';
// (Aquí podrías añadir authMiddleware si quieres que sea privado)

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
export default router;
