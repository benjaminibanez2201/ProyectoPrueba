// mensaje.service.js
import axios from './root.service.js';

/**
 * Obtener conversación de una práctica (CON TOKEN para empresas)
 */
export async function getConversacionPracticaConToken(practicaId, token) {
    try {
        // Enviar el token como query parameter
        const response = await axios.get(`/comunicacion/practica/${practicaId}`, {
            params: { token } // Esto agrega ?token=... a la URL
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener conversación:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar la conversación');
    }
}

/**
 * Obtener conversación de una práctica (SIN TOKEN para coordinador autenticado)
 */
export async function getConversacionPractica(practicaId) {
    try {
        const response = await axios.get(`/comunicacion/practica/${practicaId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener conversación:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar la conversación');
    }
}

/**
 * Enviar un mensaje (desde empresa o coordinador)
 */
export async function enviarMensaje(data) {
    try {
        const response = await axios.post(
            "/comunicacion/enviar",
            data,
            {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
            );

        return response.data;
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        throw new Error(error.response?.data?.message || 'Error al enviar el mensaje');
    }
}

/**
 * Obtener bandeja de entrada
 */
export async function getBandejaEntrada() {
    try {
        const response = await axios.get('/comunicacion/bandeja');
        return response.data;
    } catch (error) {
        console.error('Error al obtener bandeja:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar la bandeja');
    }
}

/**
 * Obtener mensajes enviados
 */
export async function getMensajesEnviados() {
    try {
        const response = await axios.get('/comunicacion/enviados');
        return response.data;
    } catch (error) {
        console.error('Error al obtener enviados:', error);
        throw new Error(error.response?.data?.message || 'Error al cargar mensajes enviados');
    }
}

/**
 * Marcar mensaje como leído
 */
export async function marcarComoLeido(mensajeId) {
    try {
        const response = await axios.patch(`/comunicacion/${mensajeId}/leido`);
        return response.data;
    } catch (error) {
        console.error('Error al marcar como leído:', error);
        throw new Error(error.response?.data?.message || 'Error al marcar como leído');
    }
}

/**
 * Obtener cantidad de mensajes no leídos
 */
export async function getNoLeidos() {
    try {
        const response = await axios.get('/comunicacion/no-leidos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener no leídos:', error);
        return { data: { noLeidos: 0 } };
    }
}