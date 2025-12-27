/**
 * ENRUTADOR DE COMUNICACIÓN
 * Define los endpoints para el sistema de mensajería interna entre coordinadores y empresas
 */
import { Router } from "express";
import {
  enviarMensaje,
  getConversacion,
  getBandejaEntrada,
  getMensajesEnviados,
  marcarLeido,
  getNoLeidos,
  getNoLeidosEmpresa,
} from "../controllers/comunicacion.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * 1. ENVIAR MENSAJE
 * POST /api/comunicacion/enviar
 * verifica si viene un 'token' (empresa) o si hay una sesión activa (coordinador)
 */
router.post("/enviar", enviarMensaje);

/**
 * 2. OBTENER CONVERSACIÓN DE UNA PRÁCTICA
 * GET /api/comunicacion/practica/:practicaId
 * - Si hay un token en la URL, se permite el paso al controlador (la empresa)
 * - Si no hay token, se ejecuta 'checkAuth' para verificar que sea un coordinador logueado
 */
router.get(
  "/practica/:practicaId",
  (req, res, next) => {
    if (req.query.token) {
      return next(); // Es una empresa con acceso directo
    }
    return checkAuth(req, res, next); // Es un usuario del sistema, requiere login
  },
  getConversacion
);

/**
 * 3. BANDEJA DE ENTRADA (coordinador)
 * GET /api/comunicacion/bandeja
 */
router.get("/bandeja", checkAuth, getBandejaEntrada);

/**
 * 4. MENSAJES ENVIADOS (Coordinador)
 * GET /api/comunicacion/enviados
 */
router.get("/enviados", checkAuth, getMensajesEnviados);

/**
 * 5. MARCAR MENSAJE COMO LEÍDO
 * PATCH /api/comunicacion/:id/leido
 * Permite marcar como leído si la empresa tiene su token o si el coordinador está en su sesión
 */
router.patch(
  "/:id/leido",
  (req, res, next) => {
    if (req.query.token) {
      return next();
    }
    return checkAuth(req, res, next);
  },
  marcarLeido
);

/**
 * 6. CONTADOR DE NO LEÍDOS (Coordinador)
 * GET /api/comunicacion/no-leidos
 */
router.get("/no-leidos", checkAuth, getNoLeidos);

/**
 * 7. CONTADOR DE NO LEÍDOS PARA EMPRESA
 * GET /api/comunicacion/no-leidos-empresa/:practicaId
 * Se accede mediante el token de la empresa para mostrar notificaciones en su vista externa
 */
router.get("/no-leidos-empresa/:practicaId", getNoLeidosEmpresa);

export default router;
