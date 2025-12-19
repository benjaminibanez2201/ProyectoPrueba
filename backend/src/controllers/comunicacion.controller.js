import { 
    enviarMensajeService, 
    obtenerConversacionService,
    obtenerBandejaEntradaService,
    obtenerMensajesEnviadosService,
    marcarComoLeidoService,
    contarNoLeidosService
} from "../services/comunicacion.service.js";
import { validarTokenEmpresa } from "../services/empresa.service.js"; 
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

/**
 * Enviar mensaje (Empresa o Coordinador)
 */
export const enviarMensaje = async (req, res) => {
    try {
        const { asunto, contenido, destinatarioId, practicaId, token } = req.body;

        // Validaciones básicas
        if (!asunto || !contenido) {
            return handleErrorClient(res, 400, "Asunto y contenido son requeridos");
        }

        let remitenteId, remitenteTipo, destinatarioTipo, practicaIdFinal;

        // Caso 1: Envía la Empresa (con token)
        if (token) {
            const tokenData = await validarTokenEmpresa(token);
            remitenteId = tokenData.empresa.userId; // Asume que la empresa tiene un userId
            remitenteTipo = "empresa";
            destinatarioTipo = "coordinador";
            practicaIdFinal = tokenData.practica.id;

            // El destinatario debe ser el coordinador de esa práctica
            // (Puedes obtenerlo de la práctica o pasarlo desde el frontend)
            if (!destinatarioId) {
                return handleErrorClient(res, 400, "Se requiere el ID del coordinador destinatario");
            }

        } 
        // Caso 2: Envía el Coordinador (autenticado)
        else if (req.user && req.user.role === 'coordinador') {
            remitenteId = req.user.id;
            remitenteTipo = "coordinador";
            destinatarioTipo = "empresa";
            practicaIdFinal = practicaId;

            if (!destinatarioId || !practicaId) {
                return handleErrorClient(res, 400, "Se requiere destinatarioId y practicaId");
            }
        } 
        else {
            return handleErrorClient(res, 403, "No autorizado para enviar mensajes");
        }

        const mensaje = await enviarMensajeService({
            practicaId: practicaIdFinal,
            asunto,
            contenido,
            remitenteId,
            remitenteTipo,
            destinatarioId,
            destinatarioTipo
        });

        return handleSuccess(res, 201, "Mensaje enviado exitosamente", mensaje);

    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener conversación de una práctica
 */
export const getConversacion = async (req, res) => {
    try {
        const { practicaId } = req.params;
        const userId = req.user.id;

        const conversacion = await obtenerConversacionService(practicaId, userId);
        return handleSuccess(res, 200, "Conversación obtenida", conversacion);

    } catch (error) {
        console.error("Error al obtener conversación:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener bandeja de entrada
 */
export const getBandejaEntrada = async (req, res) => {
    try {
        const userId = req.user.id;
        const bandeja = await obtenerBandejaEntradaService(userId);
        return handleSuccess(res, 200, "Bandeja de entrada obtenida", bandeja);

    } catch (error) {
        console.error("Error al obtener bandeja:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener mensajes enviados
 */
export const getMensajesEnviados = async (req, res) => {
    try {
        const userId = req.user.id;
        const mensajes = await obtenerMensajesEnviadosService(userId);
        return handleSuccess(res, 200, "Mensajes enviados obtenidos", mensajes);

    } catch (error) {
        console.error("Error al obtener enviados:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Marcar mensaje como leído
 */
export const marcarLeido = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const mensaje = await marcarComoLeidoService(id, userId);
        return handleSuccess(res, 200, "Mensaje marcado como leído", mensaje);

    } catch (error) {
        console.error("Error al marcar leído:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener cantidad de mensajes no leídos
 */
export const getNoLeidos = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await contarNoLeidosService(userId);
        return handleSuccess(res, 200, "No leídos obtenidos", { noLeidos: count });

    } catch (error) {
        console.error("Error al contar no leídos:", error);
        return handleErrorServer(res, 500, error.message);
    }
};