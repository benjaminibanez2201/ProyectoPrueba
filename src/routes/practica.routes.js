import { Router } from "express";
import { PracticaController } from "../controllers/practica.controller.js";

const router = Router();
const controller = new PracticaController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
