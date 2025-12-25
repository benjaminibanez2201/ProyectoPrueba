// 1. Importamos la instancia de Axios que ya tiene el token
import instance from './root.service.js';

/**
 * Llama al endpoint GET /users/alumnos del backend.
 *
 * El token JWT se añade automáticamente gracias
 * al interceptor de 'root.service.js'.
 */
export const getAlumnos = async () => {
  try {
    // 2. Usamos 'instance' para llamar a la ruta
    const response = await instance.get('/users/alumnos');
    
    // 3. Devuelve los datos (tu handleSuccess los envuelve en 'data')
    return response.data.data; 
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    // 4. Propaga el error para que el componente lo atrape
    throw error.response?.data || error; 
  }
};

// 1. Para obtener TODOS los alumnos (sin ID)
export const getAllAlumnosDetalles = async () => {
  const response = await instance.get('/users/alumnos/detalles');
  return response.data.data;
};

// 2. Para obtener UN alumno específico (con ID)
export const getAlumnoDetalles = async (id) => {
  if (!id) {
    throw new Error("ID del alumno no proporcionado");
  }

  const response = await instance.get(`/users/alumnos/${id}/detalles`);
  return response.data.data;
};
