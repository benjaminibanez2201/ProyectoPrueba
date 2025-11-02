import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import practicaRoutes from "./practica.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/practicas", practicaRoutes);
}
