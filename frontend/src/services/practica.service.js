import instance from './root.service.js'; // 1. Importamos tu Axios (root.service)

/**
 * Esta es la función getPracticas() que tu Dashboard está buscando.
 * Es la función del FRONTEND que llama al BACKEND.
 *
 * Llama al endpoint GET /api/practicas
 */
export const getPracticas = async () => {
  try {
    const response = await instance.get('/practicas');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener prácticas:', error);
    throw error.response.data || error.message;
  }
};

//llama al endpoint GET /practicas/my-practice del backend para obtener a el alumno logueado
export const getMyPractica = async () => {
  try {
    const response = await instance.get('/practicas/my-practice');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener mi práctica:', error);
    throw error.response?.data || error;
  }
};

// (Podríamos añadir más funciones aquí en el futuro,
// como updateEstado, etc.)

/**
 * Llama al endpoint POST /practicas/postular del backend
 * para crear la postulación del alumno.
 * @param {object} data - Los datos del formulario
 */
export const postularPractica = async (data) => {
  try {
    // 1. Llama al backend con los datos del formulario
    const response = await instance.post('/practicas/postular', data);
    
    // 2. Devuelve la nueva práctica creada (con el token)
    return response.data.data; 
    
  } catch (error) {
    console.error('Error al postular práctica:', error);
    // 'throw' es importante para que el formulario sepa que falló
    throw error.response?.data || error; 
  }
};