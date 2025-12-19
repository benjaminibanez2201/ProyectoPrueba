import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import practicaRoutes from "./practica.routes.js";
import userRoutes from "./user.routes.js";
import empresaRoutes from "./empresa.routes.js";
import coordinadorRoutes from "./coordinador.routes.js";
import formularioRoutes from "./formulario.routes.js";
import documentoRoutes from "./documento.routes.js";
import comunicacionRoutes from "./comunicacion.routes.js";

const router = Router();

// El router principal solo se encarga de definir las sub-rutas
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/practicas", practicaRoutes);
router.use("/users", userRoutes);
router.use("/empresa", empresaRoutes);
router.use("/formularios", formularioRoutes);
router.use("/documentos", documentoRoutes);
router.use("/coordinador", coordinadorRoutes);
router.use("/comunicacion", comunicacionRoutes);

// Exportamos el router para que index.js lo use
export default router;