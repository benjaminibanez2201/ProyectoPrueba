import { Router } from "express";
import { FormularioController } from "../controllers/formulario.controller.js";
// (Aquí podrías añadir authMiddleware si quieres que sea privado)

const router = Router();
const controller = new FormularioController();

// Ruta para obtener la estructura del formulario
router.get("/plantilla/:tipo", controller.getPlantillaByTipo);

router.get("/", controller.getAllPlantillas); // Listar todas
router.put("/:id", controller.updatePlantilla); // Guardar cambios
export default router;
