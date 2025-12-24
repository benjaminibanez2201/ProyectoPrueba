import { Router } from "express";
import { 
    enviarMensaje, 
    getConversacion,
    getBandejaEntrada,
    getMensajesEnviados,
    marcarLeido,
    getNoLeidos,
    getNoLeidosEmpresa
} from "../controllers/comunicacion.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js"; 

const router = Router();

// Enviar mensaje (abierta para empresa con token o coordinador con auth)
router.post("/enviar", enviarMensaje);

// Obtener conversación de una práctica (requiere autenticación)
//router.get("/practica/:practicaId", checkAuth, getConversacion);
// Cambia la ruta de obtención de conversación por esta:
router.get("/practica/:practicaId", (req, res, next) => {
    if (req.query.token) {
        return next();
    }
    return checkAuth(req, res, next);
}, getConversacion);

// Bandeja de entrada (requiere autenticación)
router.get("/bandeja", checkAuth, getBandejaEntrada);

// Mensajes enviados (requiere autenticación)
router.get("/enviados", checkAuth, getMensajesEnviados);

// Marcar como leído (requiere autenticación o token)
router.patch("/:id/leido", (req, res, next) => {
    if (req.query.token) {
        return next();
    }
    return checkAuth(req, res, next);
}, marcarLeido);

// Cantidad de no leídos (requiere autenticación)
router.get("/no-leidos", checkAuth, getNoLeidos);

// Cantidad de no leídos para empresa (con token)
router.get("/no-leidos-empresa/:practicaId", getNoLeidosEmpresa);

export default router;