import instance from './root.service.js';

//No necesita el JWT porque la autenticación se realiza mediante el token de acceso único


//llama al backend para validar el token y obtener los detalles de la práctica
export const validarTokenEmpresa = async (token) => {
    try {
        const response = await instance.get(`/empresa/validar-acceso/${token}`);
        return response.data;
    } catch (error) {
        console.error('Error al validar token:', error);
        throw error.response?.data || error.message;
    }
}

//envía la confirmación para inicio oficial de la práctica
export const confirmarInicioPractica = async (token, confirmacion, respuestas) => {
    try {
        console.log("📤 Service enviando payload:", { token, respuestas }); // Debug

        // 3. Enviamos el objeto completo como espera el Backend
        const response = await instance.post('/empresa/confirmar-inicio-practica', {
            token,
            confirmacion,
            respuestas // <--- ¡ESTO ERA LO QUE FALTABA!
        });
        
        return response.data;
    } catch (error) {
        console.error('Error al confirmar inicio de práctica:', error);
        throw error.response?.data || error.message;
    }
}

