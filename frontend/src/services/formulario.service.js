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

export const getTodasLasPlantillas = async () => {
  try {
    const response = await instance.get(`/formularios`);
    return response.data.data;
  } catch (error) {
    console.error(`Error al listar las plantillas`, error);
    throw error.response?.data || error;
  }
};

// Recibe el ID y los datos nuevos (titulo, esquema, etc.)
export const actualizarPlantilla = async (id, datos) => {
  try {
    const response = await instance.put(`/formularios/${id}`, datos);
    return response.data.data;
  } catch (error) {
    console.error(`Error al actualizar la plantilla`, error);
    throw error.response?.data || error;
  }
};


export const guardarRespuesta = async (datos) => {
    try {
        const response = await instance.post('/formularios/responder', datos);
        return response.data.data;
    } catch (error) {
        console.error("Error al guardar respuesta:", error);
        throw error.response?.data || error;
     }
};
