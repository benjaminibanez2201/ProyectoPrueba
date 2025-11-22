import axios from './root.service.js';

//No necesita el JWT porque la autenticación se realiza mediante el token de acceso único


//llama al backend para validar el token y obtener los detalles de la práctica
export const validarTokenEmpresa = async (token) => {
    try {
        const response = await instance.get(`/empresa/validar/${token}`,);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

//envía la confirmación para inicio oficial de la práctica
export const confirmarInicioPractica = async (token, confirmacion) => {
    try {
        const response = await instance.post('/empresa/confirmar-inicio-practica', {
            token: token,
            confirmacion: confirmacion
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

