import { Router } from "express";
import { PracticaController } from "../controllers/practica.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 

const router = Router();
const controller = new PracticaController();
// Obtener todas las prácticas
router.get("/", authMiddleware(["coordinador"]), controller.getAll);
// Obtener la práctica del alumno autenticado
router.get("/me", authMiddleware(["alumno"]), controller.getMyPractica);
// Obtener práctica por ID
router.get("/:id", authMiddleware(["coordinador", "alumno", "empresa"]), controller.getById);

router.post("/", authMiddleware(["coordinador"]), controller.create);

router.post("/postular", authMiddleware(["alumno"]), controller.postularPractica);

router.put("/:id", authMiddleware(["coordinador", "empresa"]), controller.update);

router.delete("/:id", authMiddleware(["coordinador"]), controller.delete);

router.put("/estado/:id", authMiddleware(["coordinador"]), controller.actualizarEstado);

router.patch("/:id/cerrar", authMiddleware(["coordinador"]), controller.cerrarPractica);

router.patch("/:id/aprobar", authMiddleware(["coordinador"]), controller.aprobarInicioPractica);
router.patch("/:id/observar", authMiddleware(["coordinador"]), controller.observarPractica);

router.post("/:id/finalizar", authMiddleware(["alumno"]), controller.finalizarPractica);

export default router;
