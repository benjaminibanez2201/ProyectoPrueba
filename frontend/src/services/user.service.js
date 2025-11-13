// 1. Importamos la instancia de Axios que ya tiene el token
import instance from './root.service.js';

/**
 * Llama al endpoint GET /users/alumnos del backend.
 * (Cumple con el RF2)
 *
 * El token JWT se añade automáticamente gracias
 * al interceptor de 'root.service.js'.
 */
export const getAlumnos = async () => {
  try {
    // 2. Usamos 'instance' para llamar a la ruta
    //
    // NOTA IMPORTANTE SOBRE LA URL:
    // Tu baseURL es '/api'. Tu ruta en user.routes.js es '/alumnos'.
    // Asumo que en tu app.js del backend tienes:
    // app.use('/api/users', userRoutes);
    // Por eso la URL final es '/users/alumnos'.
    //
    // Si en tu app.js tienes: app.use('/api', userRoutes);
    // entonces la URL aquí debe ser solo: '/alumnos'
    //
    // Voy a usar '/users/alumnos' porque es la estructura más común.
    const response = await instance.get('/users/alumnos');
    
    // 3. Devuelve los datos (tu handleSuccess los envuelve en 'data')
    return response.data.data; 
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    // 4. Propaga el error para que el componente lo atrape
    throw error.response?.data || error; 
  }
};

/**
 * Llama al endpoint GET /users/alumnos/:id/detalles
 * (Cumple con el RF5)
 */
export const getAlumnoDetalles = async (id) => {
  try {
    const response = await instance.get(`/users/alumnos/${id}/detalles`);
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener detalles del alumno ${id}:`, error);
    throw error.response?.data || error;
  }
};