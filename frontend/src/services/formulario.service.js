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

export const crearPlantilla = async (datos) => {
  try {
    const response = await instance.post('/formularios', datos);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const eliminarPlantilla = async (id) => {
  try {
    const response = await instance.delete(`/formularios/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- NUEVA FUNCIÓN: Envía la Bitácora a la ruta dedicada ---
export const postBitacora = async (data) => {
    try {
        // Llama al endpoint específico que creaste en el Backend (router.post('/bitacora'))
        const response = await instance.post('/formularios/bitacora', data); 
        
        // Devolvemos la respuesta
        return response.data; 
    } catch (error) {
        console.error("Error al guardar Bitácora:", error);
        // Usa la misma lógica de tu archivo para propagar el error
        throw error.response?.data || error;
    }
};

export const getRespuesta = async (id) => {
    const response = await instance.get(`/formularios/respuesta/${id}`);
    return response.data;
};

// Alumno corrige su postulación rechazada
export const corregirPostulacionRespuesta = async (id, respuestas) => {
  const response = await instance.put(`/formularios/respuesta/${id}/correccion`, { respuestas });
  return response.data;
};

// Alumno elimina su propia bitácora
export const deleteBitacora = async (id) => {
  const response = await instance.delete(`/formularios/bitacora/${id}`);
  return response.data;
};