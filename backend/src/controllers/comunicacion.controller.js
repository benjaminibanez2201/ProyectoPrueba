import { enviarMensajeService, obtenerHistorialService } from "../services/comunicacion.service.js";
import { validarTokenEmpresa } from "../services/empresa.service.js"; 
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

// --- Enviar Mensaje (Empresa o Coordinador) ---
export const enviarMensaje = async (req, res) => {
    try {
        const { contenido, practicaId, token } = req.body;
        let remitente = "";
        let idFinal = practicaId;

        // Caso 1: Envía la Empresa (trae un token en el body)
        if (token) {
            const tokenData = await validarTokenEmpresa(token);
            idFinal = tokenData.practica.id;
            remitente = "empresa";
        } 
        // Caso 2: Envía el Coordinador (está autenticado con req.user)
        else if (req.user && req.user.role === 'coordinador') {
            remitente = "coordinador";
        } else {
            return handleErrorClient(res, 403, "No autorizado para enviar mensajes.");
        }

        const mensaje = await enviarMensajeService(idFinal, contenido, remitente);
        return handleSuccess(res, 201, "Mensaje enviado exitosamente.", mensaje);

    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
};

// --- Obtener Historial ---
export const getHistorial = async (req, res) => {
    try {
        const { id } = req.params; // ID de la práctica
        const historial = await obtenerHistorialService(id);
        return handleSuccess(res, 200, "Historial recuperado.", historial);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
};