import axios from './root.service.js';

/**
 * Sube un archivo al servidor.
 * @param {File} file - El archivo seleccionado por el usuario (del input type="file")
 * @param {string} tipo - 'Informe' o 'Bitácora'
 * @param {number} practicaId - El ID de la práctica asociada
 */
export async function uploadDocumento(file, tipo, practicaId) {
    try {
        const formData = new FormData();//crear un objeto formdata 
        formData.append('documento', file);
        formData.append('tipo', tipo);
        formData.append('practicaId', practicaId);

        //se envia la petiticion post
        const response = await axios.post('/documentos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al subir el documento:', error);
        //se devuelve el error formateado para que el front lo muestre
        return error.response?.data || {status: 'Error', message: 'Error de conexión'};
    }
}

/**
 * Elimina un documento por su ID
 */
export async function deleteDocumento(id) {
  try {
    const response = await axios.delete(`/documentos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return error.response?.data || { status: "Error", message: "Error de conexión" };
  }
}