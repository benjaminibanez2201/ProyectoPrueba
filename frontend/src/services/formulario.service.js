import instance from './root.service.js';
//Puente
// Obtener una plantilla por su tipo
export const getPlantilla = async (tipo) => {
  try {
    const response = await instance.get(`/formularios/plantilla/${tipo}`);
    
    // Devolvemos el objeto 'data' que contiene la plantilla
    return response.data.data; 
  } catch (error) {
    console.error(`Error al obtener plantilla ${tipo}:`, error);
    throw error.response?.data || error;
  }
};

// Aquí podrías añadir más funciones, por ejemplo:
// export const guardarRespuesta = async (datos) => { ... }