import instance from './root.service.js'; // 1. Importamos tu Axios (root.service)

/**
 * Esta es la función getPracticas() que tu Dashboard está buscando.
 * Es la función del FRONTEND que llama al BACKEND.
 *
 * Llama al endpoint GET /api/practicas
 */
export const getPracticas = async () => {
  try {
    // 2. Usamos 'instance' para llamar a la ruta
    // Tu baseURL en root.service.js es '/api'
    // Tu ruta en practica.routes.js es '/'
    // Por lo tanto, la URL final es '/api' + '/' = '/api'
    // ... ¡Espera! Eso está mal.
    //
    // Déjame revisar...
    // root.service.js -> baseURL: '/api'
    // practica.routes.js -> router.get("/", ..., controller.getAll);
    //
    // Para que esto funcione, tu archivo 'index.js' (o app.js) del backend
    // debe tener:
    // app.use('/api/practicas', practicaRoutes);
    //
    // Si es así, la URL correcta a llamar es: '/practicas'
    // (Axios automáticamente le pondrá el /api)

    const response = await instance.get('/practicas');

    // 3. ¡ARREGLO DEL "DOBLE DATA"!
    // Tu controller (el que me mostraste) envía:
    // handleSuccess(..., practicas)
    // Tu handleSuccess (sabemos por el login) lo envuelve en 'data':
    // { status: 'Success', data: [ ...practicas... ] }
    //
    // Por eso, devolvemos response.data.data
    return response.data.data;
    
  } catch (error) {
    console.error('Error al obtener prácticas:', error);
    throw error.response.data || error.message;
  }
};

// (Podríamos añadir más funciones aquí en el futuro,
// como updateEstado, etc.)